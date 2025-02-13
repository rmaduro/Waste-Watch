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

		/// <summary>
		/// Endpoint de recuperação de password.
		/// </summary>
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
			var callbackUrl = $"{Request.Scheme}://{Request.Host}/reset-password?email={model.Email}&token={encodedToken}";

			await _emailSender.SendEmailAsync(model.Email, "Recuperação de Password",
				$"Clique no link para redefinir sua password: <a href='{callbackUrl}'>Redefinir Password</a>");

			return Ok(new { message = "Email de recuperação enviado com sucesso" });
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
}
