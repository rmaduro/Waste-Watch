
using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models.Bin
{
    public class BinLocation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public double Latitude { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}


