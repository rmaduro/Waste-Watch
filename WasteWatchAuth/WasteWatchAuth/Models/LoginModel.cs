using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	public class LoginModel
	{
		[Required(ErrorMessage = "O email é obrigatório")]
		[EmailAddress(ErrorMessage = "Formato de email inválido")]
		public string Email { get; set; }

		[Required(ErrorMessage = "A password é obrigatória")]
		public string Password { get; set; }
	}
}
