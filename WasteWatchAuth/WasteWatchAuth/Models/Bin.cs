using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a waste bin with its physical and operational properties.
	/// </summary>
	public class Bin
	{
		/// <summary>
		/// Unique identifier for the bin.
		/// </summary>
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// Type of the bin (e.g., Recycling, General Waste).
		/// </summary>
		[Required]
		public BinType Type { get; set; }

		/// <summary>
		/// Current status of the bin (e.g., Active, Maintenance, NotFunctional).
		/// </summary>
		[Required]
		public BinStatus Status { get; set; }

		/// <summary>
		/// Maximum capacity of the bin in liters.
		/// </summary>
		[Required]
		public double Capacity { get; set; }

		/// <summary>
		/// Current fill level of the bin in liters.
		/// </summary>
		[Required]
		public double CurrentFillLevel { get; set; }

		/// <summary>
		/// The date and time when the bin was last emptied.
		/// </summary>
		public DateTime LastEmptied { get; set; }

		/// <summary>
		/// Location of the bin (latitude and longitude).
		/// </summary>
		[Required]
		public BinLocation Location { get; set; }
	}
}