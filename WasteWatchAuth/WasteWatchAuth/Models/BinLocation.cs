using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents the geographical location of a bin.
	/// </summary>
	public class BinLocation
	{
		/// <summary>
		/// Unique identifier for the bin location.
		/// </summary>
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// Longitude coordinate of the bin location.
		/// </summary>
		[Required]
		public string Longitude { get; set; }

		/// <summary>
		/// Latitude coordinate of the bin location.
		/// </summary>
		[Required]
		public string Latitude { get; set; }

		/// <summary>
		/// Timestamp indicating when the location was registered or last updated.
		/// </summary>
		public DateTime Timestamp { get; set; } = DateTime.UtcNow;
	}
}