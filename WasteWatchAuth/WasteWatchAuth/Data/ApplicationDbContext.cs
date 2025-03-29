using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Models;
using WasteWatchAuth.Models.Bin;
using WasteWatchAuth.Models.Colaborator;
using WasteWatchAuth.Models.Maintenance;
using WasteWatchAuth.Models.Vehicle;

namespace WasteWatchAuth.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }

        public DbSet<Collaborator> Collaborators { get; set; }

		public DbSet<Bin> Bins { get; set; }
		public DbSet<BinLocation> BinLocations { get; set; }
		public DbSet<MaintenanceHistory> MaintenanceHistories { get; set; }
		public DbSet<CollectionHistory> CollectionHistories { get; set; }




	}
}
