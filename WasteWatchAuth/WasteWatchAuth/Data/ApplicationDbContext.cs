using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Models;

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
		public DbSet<Routes> Routes { get; set; }
		public DbSet<RouteLocation> RouteLocations { get; set; }





	}
}
