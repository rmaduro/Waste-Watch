using Microsoft.Build.Framework;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents the request data required to initiate a maintenance process on a bin.
	/// </summary>
	public class MaintenanceRequest
	{
		/// <summary>
		/// The identifier of the user who is performing or registering the maintenance.
		/// </summary>
		[Required]
		public string UserId { get; set; }

		/// <summary>
		/// The type of maintenance to be performed (e.g., "Repair", "Replacement").
		/// </summary>
		[Required]
		public string MaintenanceType { get; set; }

		/// <summary>
		/// The new status to apply to the bin (e.g., "Maintenance", "Non-Functional").
		/// </summary>
		[Required]
		public string NewStatus { get; set; }

		/// <summary>
		/// Optional description providing more details about the maintenance.
		/// </summary>
		public string Description { get; set; }
	}
}