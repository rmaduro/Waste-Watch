using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.UI.Services;
using WasteWatchAuth.Services;
using Microsoft.AspNetCore.Antiforgery;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Controllers
{
	/// <summary>
	/// Controller responsible for handling authentication operations such as login, logout,
	/// registration, password reset, and user information retrieval.
	/// </summary>

	[Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IEmailSender _emailSender;
        private readonly ActivityLogService _activityLogService;
        private readonly IAntiforgery _antiforgery;

        public AuthController(
            UserManager<IdentityUser> userManager,
            SignInManager<IdentityUser> signInManager,
            IEmailSender emailSender,
            ActivityLogService activityLogService,
            IAntiforgery antiforgery)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _activityLogService = activityLogService;
            _antiforgery = antiforgery;
        }




        /// <summary>
        /// Retrieves the currently authenticated user's email, username, and roles.
        /// </summary>
        /// <returns>Returns the current user's details or Unauthorized if not authenticated.</returns>

		[HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new
            {
                user = new
                {
                    user.Email,
                    user.UserName,
                    roles
                }
            });
        }

        /// <summary>
        /// Authenticates the user using email and password credentials.
        /// </summary>
        /// <param name="model">LoginModel containing email and password.</param>
        /// <returns>Returns the user info and antiforgery token if login is successful; otherwise, returns Unauthorized.</returns>

		[HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized(new { message = "Credenciais inválidas" });

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, isPersistent: true, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized(new { message = "Credenciais inválidas" });

            var roles = await _userManager.GetRolesAsync(user);

            await _activityLogService.LogActivityAsync("Login", $"User {user.Email} logged in.");

            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });

            return Ok(new
            {
                message = "Login bem-sucedido",
                user = new
                {
                    user.Email,
                    user.UserName,
                    roles
                }
            });
        }



        /// <summary>
        /// Logs out the current user, deletes authentication cookies, clears the session, and logs the event.
        /// </summary>
        /// <param name="request">LogoutRequest containing the user's email.</param>
        /// <returns>Returns a success message if logout is successful.</returns>

		[Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            await _signInManager.SignOutAsync();

            
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, 
                SameSite = SameSiteMode.None, 
                Path = "/", 
                Expires = DateTimeOffset.UtcNow.AddDays(-1) 
            };
            Response.Cookies.Delete(".AspNetCore.Identity.Application", cookieOptions);

            HttpContext.Session.Clear();

            await _activityLogService.LogActivityAsync("Logout", $"User {request.Email} logged out.");

            return Ok(new { message = "Logged out successfully" });
        }

		/// <summary>
		/// Registers a new user with the specified email, password, and role. Only accessible by Admins.
		/// </summary>
		/// <param name="model">RegisterModel with user details.</param>
		/// <returns>Returns success message or error details.</returns>
		[Authorize(Roles = "Admin")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = new IdentityUser
            {
                UserName = model.Email,
                Email = model.Email
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!string.IsNullOrEmpty(model.Role))
            {
                await _userManager.AddToRoleAsync(user, model.Role);
            }

            await _activityLogService.LogActivityAsync("Register", $"Admin {User.Identity.Name} registered user {model.Email} with role {model.Role}.");

            return Ok(new
            {
                message = "Utilizador registado com sucesso",
                user = new { user.Email, user.UserName, role = model.Role }
            });
        }


        /// <summary>
        /// Initiates the password recovery process by generating a token and sending a reset email.
        /// </summary>
        /// <param name="model">ForgotPasswordModel containing the user's email.</param>
        /// <returns>Returns a success message and the reset link if user exists.</returns>
		[HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return BadRequest(new { message = "Utilizador não encontrado" });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var resetLink = $"http://localhost:4200/define-password?email={model.Email}&token={encodedToken}";

            var emailBody = $@"
    <html>
    <head>
        <style>
            body {{
                font-family: 'Helvetica Neue', Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f7fa;
                color: #333;
            }}
            .email-container {{
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }}
            h1 {{
                color: #2d3748;
                font-size: 26px;
                font-weight: 700;
                margin-bottom: 20px;
                text-align: center;
            }}
            p {{
                font-size: 16px;
                line-height: 1.6;
                color: #555;
                margin-bottom: 15px;
                text-align: center;
            }}
            .btn {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #01a33c; /* Novo fundo do botão */
                color: #ffffff; /* Texto branco */
                text-decoration: none;
                border-radius: 5px;
                font-weight: 600;
                text-align: center;
                margin: 0 auto;
                border: 1px solid #01a33c; /* Cor da borda do botão */
                transition: all 0.3s ease;
                display: block;
                width: 100%;
                max-width: 300px; /* Limitar a largura do botão */
            }}
            .btn:hover {{
                background-color: #019f37; /* Cor de fundo do botão ao passar o mouse */
                border-color: #019f37;
                text-decoration: none;
            }}

            .btn a{{
            text-style: none;
}}
            .footer {{
                font-size: 14px;
                color: #6b7280;
                text-align: center;
                margin-top: 30px;
            }}
            .footer a {{
                color: #6b7280;
                text-decoration: none;
            }}
            .footer a:hover {{
                text-decoration: underline;
            }}
        </style>
    </head>
    <body>
        <div class='email-container'>
            <h1>Recuperação de Palavra-Passe</h1>
            <p>Olá,</p>
            <p>Recebemos um pedido para redefinir a sua palavra-passe. Se não foi você a fazer este pedido, por favor ignore este e-mail.</p>
            <p>Para redefinir a sua palavra-passe, por favor clique no link abaixo:</p>
            <a href='{resetLink}' class='btn'>Redefinir a Minha Palavra-Passe</a>
            <p>O link acima tem validade de 24 horas. Se não o utilizar dentro desse prazo, será necessário solicitar um novo pedido de recuperação.</p>
            <p>Caso tenha algum problema ou dúvida, por favor entre em contacto com o nosso suporte.</p>
            <div class='footer'>
                <p>Atenciosamente,</p>
                <p><strong>WasteWatch</strong></p>
                <p><a href='#'>Contactar Suporte</a></p>
            </div>
        </div>
    </body>
    </html>";

            await _emailSender.SendEmailAsync(
                model.Email,
                "Recuperação de Palavra-Passe",
                emailBody
            );

            return Ok(new { message = "E-mail de recuperação enviado com sucesso", resetLink = resetLink });
        }

        /// <summary>
        /// Resets the user's password using a reset token and the new password provided.
        /// </summary>
        /// <param name="model">ResetPasswordModel containing email, token, and new password.</param>
        /// <returns>Returns a success message or validation errors.</returns>

		[HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return BadRequest(new { message = "Utilizador não encontrado" });

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.Token));
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _activityLogService.LogActivityAsync("Reset Password", $"User {model.Email} reset their password.");

            return Ok(new { message = "Password redefinida com sucesso" });
        }
    }

}