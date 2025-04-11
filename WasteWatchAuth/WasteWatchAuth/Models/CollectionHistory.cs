using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a record of a bin collection event, including the bin, vehicle, timestamp,
	/// collection status, any issues encountered, and the amount of waste collected.
	/// </summary>
	public class CollectionHistory
	{
		/// <summary>
		/// Unique identifier for the collection history record.
		/// </summary>
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// The ID of the bin that was collected.
		/// </summary>
		[Required]
		public int BinId { get; set; }

		/// <summary>
		/// The ID of the vehicle used during the collection.
		/// </summary>
		[Required]
		public int VehicleId { get; set; }

		/// <summary>
		/// The exact date and time the collection occurred.
		/// </summary>
		[Required]
		public DateTime Timestamp { get; set; }

		/// <summary>
		/// The status of the collection (e.g., Completed, Failed).
		/// </summary>
		[Required]
		public CollectionStatus CollectionStatus { get; set; }

		/// <summary>
		/// Any issues or anomalies logged during the collection process.
		/// </summary>
		public string IssuesLogged { get; set; } = string.Empty;

		/// <summary>
		/// The amount of waste collected during the collection, in kilograms.
		/// </summary>
		[Required]
		public double AmountCollected { get; set; }
	}
}