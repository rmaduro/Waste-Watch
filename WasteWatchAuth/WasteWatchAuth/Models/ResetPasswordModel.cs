using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Model used to reset a user's password.
	/// </summary>
	public class ResetPasswordModel
	{
		/// <summary>
		/// User's email address.
		/// </summary>
		[Required(ErrorMessage = "Email is required")]
		[EmailAddress(ErrorMessage = "Invalid email format")]
		public string Email { get; set; }

		/// <summary>
		/// Verification token sent to the user to allow password reset.
		/// </summary>
		[Required(ErrorMessage = "Token is required")]
		public string Token { get; set; }

		/// <summary>
		/// New user password. Must be at least 6 characters long.
		/// </summary>
		[Required(ErrorMessage = "New password is required")]
		[MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
		public string NewPassword { get; set; }
	}
}