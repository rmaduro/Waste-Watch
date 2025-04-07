
	using System;
	using System.ComponentModel.DataAnnotations;

	namespace WasteWatchAuth.Models
	{
		public class BinLocation
		{
			[Key]
			public int Id { get; set; }

			[Required]
			public string Longitude { get; set; }

			[Required]
			public string Latitude { get; set; }

			public DateTime Timestamp { get; set; } = DateTime.UtcNow;
		}
	}


