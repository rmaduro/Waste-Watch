using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a historical record of a maintenance event performed on a bin.
	/// </summary>
	public class MaintenanceHistory
	{
		/// <summary>
		/// Unique identifier of the maintenance record.
		/// </summary>
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// Identifier of the bin that underwent maintenance.
		/// </summary>
		[Required]
		public int BinId { get; set; }

		/// <summary>
		/// Navigation property to the bin entity.
		/// </summary>
		[ForeignKey("BinId")]
		public Bin Bin { get; set; }

		/// <summary>
		/// Identifier of the user who registered or performed the maintenance.
		/// </summary>
		[Required]
		public string UserId { get; set; }

		/// <summary>
		/// Date and time when the maintenance started.
		/// </summary>
		[Required]
		public DateTime StartDate { get; set; } = DateTime.UtcNow;

		/// <summary>
		/// Date and time when the maintenance ended. Null if still ongoing.
		/// </summary>
		public DateTime? EndDate { get; set; }

		/// <summary>
		/// Type of maintenance performed (e.g., cleaning, repair).
		/// </summary>
		[Required]
		public string MaintenanceType { get; set; }

		/// <summary>
		/// Optional description providing more details about the maintenance.
		/// </summary>
		public string Description { get; set; }
	}
}