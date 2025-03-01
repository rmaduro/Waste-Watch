using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	public class Vehicle
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public string LicensePlate { get; set; }

		[Required]
		public string DriverName { get; set; }

		[Required]
		public string Status { get; set; } // ACTIVE, IDLE, etc.

		[Required]
		public string RouteType { get; set; } // Commercial, Industrial, etc.

		[Required]
		public int MaxCapacity { get; set; } // Em kg

		public DateTime LastMaintenance { get; set; } // Última manutenção
	}
}