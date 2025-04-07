using Microsoft.Build.Framework;

namespace WasteWatchAuth.Models
{
	public class EndMaintenanceRequest
	{
		[Required]
		public string UserId { get; set; } 
	}
}
