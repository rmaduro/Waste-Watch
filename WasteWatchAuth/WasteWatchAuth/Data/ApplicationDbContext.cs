using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Data
{
	/// <summary>
	/// Main database context for the WasteWatch application.
	/// Inherits from IdentityDbContext to integrate ASP.NET Core Identity.
	/// </summary>
	public class ApplicationDbContext : IdentityDbContext
	{
		/// <summary>
		/// Constructor for ApplicationDbContext.
		/// </summary>
		/// <param name="options">The options to be used by the DbContext.</param>
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
			: base(options)
		{
		}

		/// <summary>
		/// Table for storing system activity logs.
		/// </summary>
		public DbSet<ActivityLog> ActivityLogs { get; set; }

		/// <summary>
		/// Table for storing vehicle data.
		/// </summary>
		public DbSet<Vehicle> Vehicles { get; set; }

		/// <summary>
		/// Table for storing collaborator (employee) data.
		/// </summary>
		public DbSet<Collaborator> Collaborators { get; set; }

		/// <summary>
		/// Table for storing waste bin data.
		/// </summary>
		public DbSet<Bin> Bins { get; set; }

		/// <summary>
		/// Table for storing bin location data.
		/// </summary>
		public DbSet<BinLocation> BinLocations { get; set; }

		/// <summary>
		/// Table for storing maintenance history of bins.
		/// </summary>
		public DbSet<MaintenanceHistory> MaintenanceHistories { get; set; }

		/// <summary>
		/// Table for storing collection history of bins.
		/// </summary>
		public DbSet<CollectionHistory> CollectionHistories { get; set; }

		/// <summary>
		/// Table for storing route data.
		/// </summary>
		public DbSet<Routes> Routes { get; set; }

		/// <summary>
		/// Table for storing geographic locations associated with routes.
		/// </summary>
		public DbSet<RouteLocation> RouteLocations { get; set; }

		/// <summary>
		/// Table for storing notifications to be shown in the system.
		/// </summary>
		public DbSet<Notification> Notifications { get; set; }
	}
}
