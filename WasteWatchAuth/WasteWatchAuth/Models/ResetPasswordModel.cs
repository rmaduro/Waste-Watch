using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
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
