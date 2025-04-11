using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a single geographical point (latitude and longitude) within a defined route.
	/// </summary>
	public class RouteLocation
	{
		/// <summary>
		/// Unique identifier for the route location.
		/// </summary>
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// Latitude coordinate of the location.
		/// </summary>
		[Required]
		public string Latitude { get; set; } = null!;

		/// <summary>
		/// Longitude coordinate of the location.
		/// </summary>
		[Required]
		public string Longitude { get; set; } = null!;

		/// <summary>
		/// Foreign key referencing the associated route.
		/// </summary>
		public int RouteId { get; set; }

		/// <summary>
		/// Navigation property for the associated route.
		/// </summary>
		[ForeignKey("RouteId")]
		public Routes? Route { get; set; }
	}
}