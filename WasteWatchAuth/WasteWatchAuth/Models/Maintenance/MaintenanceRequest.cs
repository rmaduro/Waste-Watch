using Microsoft.Build.Framework;

namespace WasteWatchAuth.Models.Maintenance
{
    public class MaintenanceRequest
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public string MaintenanceType { get; set; } // "Repair", "Replacement", etc.

        [Required]
        public string NewStatus { get; set; } // "Maintenance" ou "Non-Functional"

        public string Description { get; set; }
    }
}
