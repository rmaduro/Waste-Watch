using Microsoft.Build.Framework;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a notification within the WasteWatch system.
	/// Used to inform users about relevant events or alerts.
	/// </summary>
	public class Notification
	{
		/// <summary>
		/// Unique identifier for the notification.
		/// </summary>
		public int Id { get; set; }

		/// <summary>
		/// The title or headline of the notification.
		/// </summary>
		[Required]
		public string Title { get; set; }

		/// <summary>
		/// The detailed message content of the notification.
		/// </summary>
		[Required]
		public string Message { get; set; }

		/// <summary>
		/// The date and time when the notification was created.
		/// </summary>
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

		/// <summary>
		/// The type of notification (e.g., "Bin", "Fleet").
		/// </summary>
		[Required]
		public string Type { get; set; }

		/// <summary>
		/// Optional reference to a related entity (e.g., BinId or VehicleId).
		/// </summary>
		public int? ReferenceId { get; set; }
	}
}