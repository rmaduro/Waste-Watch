using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.UI.Services;
using WasteWatchAuth.Services;

namespace WasteWatchAuth.Controllers
{
	[Route("api/[controller]")] // Rota baseada no nome do controller
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly UserManager<IdentityUser> _userManager;
		private readonly SignInManager<IdentityUser> _signInManager;
		private readonly IEmailSender _emailSender;
		private readonly ActivityLogService _activityLogService;


		public AuthController(UserManager<IdentityUser> userManager, SignInManager<IdentityUser> signInManager, IEmailSender emailSender, ActivityLogService activityLogService)
		{
			_userManager = userManager;
			_signInManager = signInManager;
			_emailSender = emailSender;
			_activityLogService = activityLogService;
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

			// Obter os roles do usuário
			var roles = await _userManager.GetRolesAsync(user);

			await _activityLogService.LogActivityAsync("Login", $"User {user.Email} logged in.");

			return Ok(new
			{
				message = "Login bem-sucedido",
				user = new
				{
					user.Email,
					user.UserName,
					roles // Inclui os roles na resposta
				}
			});
		}

		/// <summary>
		/// Endpoint de logout.
		/// </summary>
		[HttpPost("logout")]
		public async Task<IActionResult> Logout()
		{
			var user = await _userManager.GetUserAsync(User);
			var userEmail = user?.Email ?? "Unknown User";

			await _signInManager.SignOutAsync();

			await _activityLogService.LogActivityAsync("Logout", $"User {userEmail} logged out.");
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

			// Gerar o token para redefinição de password
			var token = await _userManager.GeneratePasswordResetTokenAsync(user);

			// Codificar o token para evitar erros no URL
			var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));


            // Criar o link para redefinir a password (frontend deve consumir este link)
            var resetLink = $"http://localhost:4200/define-password?email={model.Email}&token={encodedToken}";



            Console.WriteLine($"TOKEN GERADO: {encodedToken}"); // Mostra o token no console

			await _emailSender.SendEmailAsync(model.Email, "Recuperação de Password",
				$"Clique no link para redefinir sua password: <a href='{resetLink}'>Redefinir Password</a>");

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

            await _activityLogService.LogActivityAsync("Reset Password", $"User {model.Email} reset their password.");


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
