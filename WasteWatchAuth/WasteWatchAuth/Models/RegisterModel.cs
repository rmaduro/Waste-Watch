using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Model used for registering new users.
	/// </summary>
	public class RegisterModel
	{
		/// <summary>
		/// User's email address.
		/// </summary>
		[Required(ErrorMessage = "Email is required")]
		[EmailAddress(ErrorMessage = "Invalid email format")]
		public string Email { get; set; }

		/// <summary>
		/// User's password. Must be at least 6 characters long.
		/// </summary>
		[Required(ErrorMessage = "Password is required")]
		[MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
		public string Password { get; set; }

		/// <summary>
		/// Role assigned to the user (e.g., Admin, FleetManager, BinManager).
		/// </summary>
		public string Role { get; set; }
	}
}