using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a route assigned to a vehicle, containing a name, type, and a list of geographical locations.
	/// </summary>
	public class Routes
	{
		/// <summary>
		/// Unique identifier for the route.
		/// </summary>
		[Key]
		public int Id { get; set; }

		/// <summary>
		/// Name of the route (e.g., "North Zone Route").
		/// </summary>
		[Required]
		public string Name { get; set; } = null!;

		/// <summary>
		/// Type of route (e.g., "Commercial", "Industrial").
		/// </summary>
		[Required]
		public string Type { get; set; } = null!;

		/// <summary>
		/// List of geographical points that define the route.
		/// </summary>
		public List<RouteLocation> Locations { get; set; } = new();
	}
}