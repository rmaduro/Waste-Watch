namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Model used for logout requests containing the email of the user to logout.
	/// </summary>

	public class LogoutRequest
	{
		public string Email { get; set; }
	}
}
