using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a collaborator in the WasteWatch system, such as a driver or maintenance worker.
	/// </summary>
	public class Collaborator
	{
		/// <summary>
		/// Unique identifier for the collaborator.
		/// </summary>
		public int Id { get; set; }

		/// <summary>
		/// Full name of the collaborator.
		/// </summary>
		[Required] public string Name { get; set; }

		/// <summary>
		/// Age of the collaborator.
		/// </summary>
		[Required] public int Age { get; set; }

		/// <summary>
		/// License number or professional registration of the collaborator.
		/// </summary>
		[Required] public string LicenseNumber { get; set; }

		/// <summary>
		/// Type of the collaborator (e.g., Driver, Technician).
		/// </summary>
		[Required] public CollaboratorType CollaboratorType { get; set; }
	}
}