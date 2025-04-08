using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WasteWatchAuth.Models
{
	public class Vehicle
	{
		public int Id { get; set; }

		[Required]
		public string LicensePlate { get; set; } = string.Empty;

		[Required]
		public VehicleType Type { get; set; } 

		[Required]
		public string Status { get; set; } = string.Empty;

		[Required]
		public string RouteType { get; set; } = string.Empty;

		public int MaxCapacity { get; set; }

		public DateTime LastMaintenance { get; set; }

		public string Latitude { get; set; }
		public string Longitude { get; set; }

		public int DriverId { get; set; }

		[ForeignKey("DriverId")]
		public Collaborator Driver { get; set; }

		public int? RouteId { get; set; }
		[ForeignKey("RouteId")]
		public Routes? Route { get; set; }
	}
}