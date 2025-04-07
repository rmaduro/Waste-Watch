using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	public class MaintenanceHistory
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public int BinId { get; set; }

		[ForeignKey("BinId")]
		public Bin Bin { get; set; }

		[Required]
		public string UserId { get; set; }

		[Required]
		public DateTime StartDate { get; set; } = DateTime.UtcNow; 

		public DateTime? EndDate { get; set; }

		[Required]
		public string MaintenanceType { get; set; } 

		public string Description { get; set; }
	}

}
