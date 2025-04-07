using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models.Bin
{
    public class Bin
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public BinType Type { get; set; }

        [Required]
        public BinStatus Status { get; set; }

        [Required]
        public double Capacity { get; set; }

        [Required]
        public double CurrentFillLevel { get; set; }

        public DateTime LastEmptied { get; set; }

        [Required]
        public BinLocation Location { get; set; }
    }
}