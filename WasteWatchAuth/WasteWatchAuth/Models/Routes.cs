using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

		// Torne o VehicleId opcional (int?) e remova o [Required]
		public int? VehicleId { get; set; }

		[ForeignKey("VehicleId")]
		public Vehicle? Vehicle { get; set; }

		// Para não dar problema de null, inicialize a lista:
		public List<RouteLocation> Locations { get; set; } = new();
	}
}