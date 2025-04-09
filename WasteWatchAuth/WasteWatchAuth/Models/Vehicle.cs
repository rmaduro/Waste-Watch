using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WasteWatchAuth.Models
{
	/// <summary>
	/// Represents a waste collection vehicle with associated metadata, such as driver, location, and assigned route.
	/// </summary>
	public class Vehicle
	{
		/// <summary>
		/// Unique identifier for the vehicle.
		/// </summary>
		public int Id { get; set; }

		/// <summary>
		/// License plate of the vehicle (e.g., "XX-YY-ZZ").
		/// </summary>
		[Required]
		public string LicensePlate { get; set; } = string.Empty;

		/// <summary>
		/// Type of the vehicle (e.g., FrontLoader, RearLoader).
		/// </summary>
		[Required]
		public VehicleType Type { get; set; }

		/// <summary>
		/// Current operational status of the vehicle (e.g., Active, InMaintenance).
		/// </summary>
		[Required]
		public string Status { get; set; } = string.Empty;

		/// <summary>
		/// Route type the vehicle typically serves (e.g., Commercial, Industrial).
		/// </summary>
		[Required]
		public string RouteType { get; set; } = string.Empty;

		/// <summary>
		/// Maximum capacity of the vehicle in liters or kilograms.
		/// </summary>
		public int MaxCapacity { get; set; }

		/// <summary>
		/// Date of the last maintenance performed on the vehicle.
		/// </summary>
		public DateTime LastMaintenance { get; set; }

		/// <summary>
		/// Last known latitude position of the vehicle.
		/// </summary>
		public string Latitude { get; set; }

		/// <summary>
		/// Last known longitude position of the vehicle.
		/// </summary>
		public string Longitude { get; set; }

		/// <summary>
		/// ID of the driver (collaborator) assigned to the vehicle.
		/// </summary>
		public int DriverId { get; set; }

		/// <summary>
		/// Reference to the collaborator (driver) entity.
		/// </summary>
		[ForeignKey("DriverId")]
		public Collaborator Driver { get; set; }

		/// <summary>
		/// Optional ID of the route assigned to this vehicle.
		/// </summary>
		public int? RouteId { get; set; }

		/// <summary>
		/// Reference to the route entity assigned to this vehicle.
		/// </summary>
		[ForeignKey("RouteId")]
		public Routes? Route { get; set; }
	}
}
