using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.UI.Services;

namespace WasteWatchAuth.Controllers
{
	[Route("api/[controller]")] // Rota baseada no nome do controller
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly UserManager<IdentityUser> _userManager;
		private readonly SignInManager<IdentityUser> _signInManager;
		private readonly IEmailSender _emailSender;

		public AuthController(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IEmailSender emailSender)
		{
			_userManager = userManager;
			_signInManager = signInManager;
			_emailSender = emailSender;
		}

		/// <summary>
		/// Endpoint de login.
		/// </summary>
		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginModel model)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var user = await _userManager.FindByEmailAsync(model.Email);
			if (user == null)
				return Unauthorized(new { message = "Credenciais inválidas" });

			var result = await _signInManager.PasswordSignInAsync(user, model.Password, false, false);
			if (!result.Succeeded)
				return Unauthorized(new { message = "Credenciais inválidas" });

			return Ok(new
			{
				message = "Login bem-sucedido",
				user = new { user.Email, user.UserName }
			});
		}

		/// <summary>
		/// Endpoint de logout.
		/// </summary>
		[HttpPost("logout")]
		public async Task<IActionResult> Logout()
		{
			await _signInManager.SignOutAsync();
			return Ok(new { message = "Logout bem-sucedido" });
		}

		/// <summary>
		/// Endpoint de registo (apenas Admins).
		/// </summary>
		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] RegisterModel model)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			// Verificar se o utilizador autenticado tem a role de Admin
			var currentUser = await _userManager.GetUserAsync(User);
			if (currentUser == null || !await _userManager.IsInRoleAsync(currentUser, "Admin"))
			{
				return Forbid(); // Retorna 403 Forbidden se o utilizador não for Admin
			}

			var user = new IdentityUser
			{
				UserName = model.Email,
				Email = model.Email
			};

			var result = await _userManager.CreateAsync(user, model.Password);

			if (!result.Succeeded)
				return BadRequest(result.Errors);

			// Adicionar o utilizador ao Role especificado
			if (!string.IsNullOrEmpty(model.Role))
			{
				await _userManager.AddToRoleAsync(user, model.Role);
			}

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

			// Gerar o token para redefinição de password
			var token = await _userManager.GeneratePasswordResetTokenAsync(user);

			// Codificar o token para evitar erros no URL
			var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));


			// Criar o link para redefinir a password (frontend deve consumir este link)
			var resetLink = $"http://localhost:4200/define-password?email={model.Email}&token={encodedToken}";



			Console.WriteLine($"TOKEN GERADO: {encodedToken}"); // Mostra o token no console

			await _emailSender.SendEmailAsync(model.Email, "🔒 Redefinição de Password - WasteWatch",
	$@"
    <html>
    <body style='font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px 0; text-align: center;'>
        <div style='max-width: 500px; background: white; padding: 30px; border-radius: 10px; 
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin: auto; text-align: left;'>
            
            <h2 style='color: #007bff; text-align: center;'>🔑 Recuperação de Password</h2>
            
            <p style='font-size: 16px; color: #333;'>Olá,</p>
            
            <p style='font-size: 16px; color: #333;'>
                Recebemos um pedido para redefinir a password associada ao seu email:
            </p>
            
            <p style='font-size: 16px; font-weight: bold; color: #007bff; text-align: center;'>
                {model.Email}
            </p>

            <p style='font-size: 16px; color: #333;'>
                Para criar uma nova password, clique no botão abaixo:
            </p>
            
            <p style='text-align: center; margin: 20px 0;'>
                <a href='{resetLink}' 
                   style='background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; 
                          border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;'>
                   🔑 Redefinir Password
                </a>
            </p>

            <p style='font-size: 14px; color: #555; text-align: center;'>
                Se o botão acima não funcionar, copie e cole este link no seu navegador:
            </p>
            
            <p style='word-break: break-word; font-size: 14px; text-align: center; color: #007bff;'>
                <a href='{resetLink}'>{resetLink}</a>
            </p>

            <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
            
            <p style='font-size: 14px; color: #777;'>
                Se você não solicitou esta alteração, pode ignorar este email. Sua conta permanecerá segura.
            </p>

            <p style='font-size: 14px; color: #777; text-align: center;'>
                <strong>Equipe WasteWatch</strong>
            </p>

        </div>
    </body>
    </html>");

			return Ok(new { message = "Email de recuperação enviado com sucesso", resetLink = resetLink });
		}





            [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return BadRequest(new { message = "Utilizador não encontrado" });

            // Decode the token
            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.Token));

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "Password redefinida com sucesso" });
        }



    }


    /// <summary>
    /// Modelo para login.
    /// </summary>
    public class LoginModel
	{
		[Required(ErrorMessage = "O email é obrigatório")]
		[EmailAddress(ErrorMessage = "Formato de email inválido")]
		public string Email { get; set; }

		[Required(ErrorMessage = "A password é obrigatória")]
		public string Password { get; set; }
	}

	/// <summary>
	/// Modelo para registo de utilizadores (apenas Admin pode usar).
	/// </summary>
	public class RegisterModel
	{
		[Required(ErrorMessage = "O email é obrigatório")]
		[EmailAddress(ErrorMessage = "Formato de email inválido")]
		public string Email { get; set; }

		[Required(ErrorMessage = "A password é obrigatória")]
		[MinLength(6, ErrorMessage = "A password deve ter pelo menos 6 caracteres")]
		public string Password { get; set; }

		public string Role { get; set; } // Permite que o admin atribua um papel ao criar um utilizador
	}

	/// <summary>
	/// Modelo para recuperação de password.
	/// </summary>
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
