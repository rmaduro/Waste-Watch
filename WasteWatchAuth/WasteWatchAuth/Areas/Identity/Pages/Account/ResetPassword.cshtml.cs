using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace WasteWatchAuth.Areas.Identity.Pages.Account
{
	public class ResetPasswordModel : PageModel
	{
		private readonly UserManager<IdentityUser> _userManager;

		public ResetPasswordModel(UserManager<IdentityUser> userManager)
		{
			_userManager = userManager;
		}

		[BindProperty]
		public ResetPasswordInputModel Input { get; set; }

		public class ResetPasswordInputModel
		{
			[Required]
			public string Email { get; set; }

			[Required]
			public string Token { get; set; }

			[Required]
			[MinLength(6)]
			public string NewPassword { get; set; }

			[Required]
			[Compare("NewPassword", ErrorMessage = "As passwords não coincidem")]
			public string ConfirmPassword { get; set; }
		}

		public async Task<IActionResult> OnPostAsync()
		{
			if (!ModelState.IsValid)
				return Page();

			var user = await _userManager.FindByEmailAsync(Input.Email);
			if (user == null)
			{
				ModelState.AddModelError(string.Empty, "Utilizador não encontrado.");
				return Page();
			}

			var result = await _userManager.ResetPasswordAsync(user, Input.Token, Input.NewPassword);

			if (!result.Succeeded)
			{
				foreach (var error in result.Errors)
				{
					ModelState.AddModelError(string.Empty, error.Description);
				}
				return Page();
			}

			TempData["SuccessMessage"] = "A sua password foi redefinida com sucesso. Faça login.";
			return RedirectToPage("./Login");
		}


		public async Task<IActionResult> OnGetAsync(string email, string token)
		{
			if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(token))
			{
				return BadRequest("Pedido inválido: email ou token ausente.");
			}

			Input = new ResetPasswordInputModel
			{
				Email = email,
				Token = token
			};

			return Page();
		}

	}
}
