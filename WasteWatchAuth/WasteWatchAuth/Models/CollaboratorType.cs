namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Specifies the role or type of a collaborator within the WasteWatch system.
	/// </summary>
	public enum CollaboratorType
	{
		/// <summary>
		/// A collaborator who is responsible for driving vehicles.
		/// </summary>
		Driver,

		/// <summary>
		/// A collaborator who is responsible for collecting waste.
		/// </summary>
		Collector
	}
}