using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Models
{
	public class Routes
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public string Name { get; set; } = null!;

		[Required]
		public string Type { get; set; } = null!;

		public List<RouteLocation> Locations { get; set; } = new();
	}
}