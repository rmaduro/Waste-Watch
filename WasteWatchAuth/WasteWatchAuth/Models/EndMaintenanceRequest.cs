using Microsoft.Build.Framework;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents the data required to end a maintenance operation on a bin.
	/// </summary>
	public class EndMaintenanceRequest
	{
		/// <summary>
		/// The identifier of the user ending the maintenance.
		/// </summary>
		[Required]
		public string UserId { get; set; }
	}
}