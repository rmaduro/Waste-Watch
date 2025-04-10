using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Model used for the forgot password request.
	/// </summary>
	public class ForgotPasswordModel
	{
		/// <summary>
		/// User's email address.
		/// </summary>
		[Required(ErrorMessage = "Email is required")]
		[EmailAddress(ErrorMessage = "Invalid email format")]
		public string Email { get; set; }
	}
}