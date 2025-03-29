using Microsoft.Build.Framework;

namespace WasteWatchAuth.Models.Maintenance
{
    public class EndMaintenanceRequest
    {
        [Required]
        public string UserId { get; set; }
    }
}
