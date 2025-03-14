using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	public class CollectionHistory
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public int BinId { get; set; } // Mantemos apenas o ID

		[Required]
		public int VehicleId { get; set; } // Mantemos apenas o ID

		[Required]
		public DateTime Timestamp { get; set; }

		[Required]
		public CollectionStatus CollectionStatus { get; set; }

		public string IssuesLogged { get; set; } // Campo opcional
		
		[Required]
		public double AmountCollected { get; set; }
	}

	public enum CollectionStatus
	{
		Completed,
		Pending,
		Failed
	}
}