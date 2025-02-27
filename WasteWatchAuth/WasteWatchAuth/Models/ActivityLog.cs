using System;
using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	public class ActivityLog
	{
		[Key]
		public int Id { get; set; }

		[Required]
		public DateTime Timestamp { get; set; }

		[Required]
		public string UserId { get; set; }

		[Required]
		public string Action { get; set; }

		public string Metadata { get; set; }
	}
}