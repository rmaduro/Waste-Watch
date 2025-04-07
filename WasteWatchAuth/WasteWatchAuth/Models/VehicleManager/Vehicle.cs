using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WasteWatchAuth.Models.Colaborator;

namespace WasteWatchAuth.Models.Vehicle
{
    public class Vehicle
    {
        public int Id { get; set; }

        [Required]
        public string LicensePlate { get; set; } = string.Empty;

        [Required]
        public VehicleType Type { get; set; } // Enumeração dos tipos de veículos

        [Required]
        public string Status { get; set; } = string.Empty;

        [Required]
        public string RouteType { get; set; } = string.Empty;

        public int MaxCapacity { get; set; }

        public DateTime LastMaintenance { get; set; }

        // Localização do Veículo
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // Relação com o Collaborator (Driver)
        public int DriverId { get; set; }

        [ForeignKey("DriverId")]
        public Collaborator Driver { get; set; }
    }
}