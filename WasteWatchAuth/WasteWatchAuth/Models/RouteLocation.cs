using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WasteWatchAuth.Models
{
	public class RouteLocation
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public string Latitude { get; set; } = null!;

		[Required]
		public string Longitude { get; set; } = null!;

		// Trocar de 'RoutesId' para 'RouteId' se quiser ficar mais claro
		public int RouteId { get; set; }

		[ForeignKey("RouteId")]
		public Routes? Route { get; set; }
	}
}