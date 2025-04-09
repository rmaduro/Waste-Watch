namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Defines the possible statuses of a bin.
	/// </summary>
	public enum BinStatus
	{
		/// <summary>
		/// The bin is active and operational.
		/// </summary>
		Active,

		/// <summary>
		/// The bin is currently not functional due to damage or issues.
		/// </summary>
		NotFunctional,

		/// <summary>
		/// The bin is undergoing maintenance.
		/// </summary>
		Maintenance
	}
}