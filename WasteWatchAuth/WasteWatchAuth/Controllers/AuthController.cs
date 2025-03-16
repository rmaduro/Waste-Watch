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

namespace WasteWatchAuth.Controllers
{
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

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return Unauthorized(new { message = "Credenciais inválidas" });

            // Set isPersistent to true for persistent cookie
            var result = await _signInManager.PasswordSignInAsync(user, model.Password, isPersistent: true, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized(new { message = "Credenciais inválidas" });

            var roles = await _userManager.GetRolesAsync(user);

            await _activityLogService.LogActivityAsync("Login", $"User {user.Email} logged in.");

            // Set anti-forgery cookie
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

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            // Get the current user
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Sign out the user
            await _signInManager.SignOutAsync();

            // Clear the authentication cookie with matching settings
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Ensure this matches the original cookie settings
                SameSite = SameSiteMode.None, // Ensure this matches the original cookie settings
                Path = "/", // Ensure this matches the original cookie settings
                Expires = DateTimeOffset.UtcNow.AddDays(-1) // Set expiration in the past to delete the cookie
            };
            Response.Cookies.Delete(".AspNetCore.Identity.Application", cookieOptions);

            // Clear the session data (if using session-based authentication)
            HttpContext.Session.Clear();

            // Log the activity
            await _activityLogService.LogActivityAsync("Logout", $"User {request.Email} logged out.");

            // Return a success response
            return Ok(new { message = "Logged out successfully" });
        }

        public class LogoutRequest
        {
            public string Email { get; set; } // User's email
        }

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

            // Corpo do email
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

            // Enviar o email de recuperação
            await _emailSender.SendEmailAsync(
                model.Email,
                "Recuperação de Palavra-Passe",
                emailBody
            );

            return Ok(new { message = "E-mail de recuperação enviado com sucesso", resetLink = resetLink });
        }





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

    public class LoginModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "A password é obrigatória")]
        public string Password { get; set; }
    }

    public class RegisterModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "A password é obrigatória")]
        [MinLength(6, ErrorMessage = "A password deve ter pelo menos 6 caracteres")]
        public string Password { get; set; }

        public string Role { get; set; }
    }

    public class ForgotPasswordModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; }
    }

    public class ResetPasswordModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Formato de email inválido")]
        public string Email { get; set; }

        [Required(ErrorMessage = "O token é obrigatório")]
        public string Token { get; set; }

        [Required(ErrorMessage = "A nova password é obrigatória")]
        [MinLength(6, ErrorMessage = "A password deve ter pelo menos 6 caracteres")]
        public string NewPassword { get; set; }
    }
}