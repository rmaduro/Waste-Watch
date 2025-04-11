namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Enumeration representing the possible statuses of a bin collection.
	/// </summary>
	public enum CollectionStatus
	{
		/// <summary>
		/// The collection was successfully completed.
		/// </summary>
		Completed,

		/// <summary>
		/// The collection is scheduled or awaiting execution.
		/// </summary>
		Pending,

		/// <summary>
		/// The collection attempt failed.
		/// </summary>
		Failed
	}
}