using System.ComponentModel.DataAnnotations;
using System.Drawing.Drawing2D;
using System.Net.NetworkInformation;

namespace WasteWatchAuth.Models
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

		public DateTime LastEmptied { get; set; }

		[Required]
		public BinLocation Location { get; set; }
	}
}
