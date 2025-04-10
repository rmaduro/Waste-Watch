using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Model used for user login.
	/// </summary>
	public class LoginModel
	{
		/// <summary>
		/// User's email address.
		/// </summary>
		[Required(ErrorMessage = "Email is required")]
		[EmailAddress(ErrorMessage = "Invalid email format")]
		public string Email { get; set; }

		/// <summary>
		/// User's password.
		/// </summary>
		[Required(ErrorMessage = "Password is required")]
		public string Password { get; set; }
	}
}