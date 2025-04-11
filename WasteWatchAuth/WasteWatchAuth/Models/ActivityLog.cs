namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a log entry that records user activity in the system.
	/// </summary>
	public class ActivityLog
	{
		/// <summary>
		/// Unique identifier for the log entry.
		/// </summary>
		public int Id { get; set; }

		/// <summary>
		/// The date and time when the activity occurred.
		/// </summary>
		public DateTime Timestamp { get; set; }

		/// <summary>
		/// The ID of the user who performed the action.
		/// </summary>
		public string UserId { get; set; }

		/// <summary>
		/// The type or name of the action performed (e.g., "Login", "CreateBin").
		/// </summary>
		public string Action { get; set; }

		/// <summary>
		/// Additional information about the activity (e.g., affected entity, status).
		/// </summary>
		public string Metadata { get; set; }
	}
}