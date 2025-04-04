using WasteWatchAuth.Models;

namespace WasteWatchAuth.Data
{
	public class DbInitializer
	{
		public static void Initialize(ApplicationDbContext context)
		{
			// Aplicar migrações automaticamente (opcional)
			context.Database.EnsureCreated();

			// Já existem dados?
			if (context.Bins.Any()) return;

			// ───────────────────────────────
			// 1. Collaborators (Drivers)
			var collaborators = new Collaborator[]
			{
				new() { Name = "Carlos Silva", Age = 40, LicenseNumber = "ABC-12345", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Ana Ribeiro", Age = 35, LicenseNumber = "DEF-67890", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "João Costa", Age = 45, LicenseNumber = "GHI-98765", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Marta Dias", Age = 38, LicenseNumber = "JKL-11223", CollaboratorType = CollaboratorType.Driver }
			};
			context.Collaborators.AddRange(collaborators);
			context.SaveChanges();

			// ───────────────────────────────
			// 2. Vehicles
			var vehicles = new Vehicle[]
			{
				new() { LicensePlate = "22-ZZ-22", Status = "Active", RouteType = "Commercial", MaxCapacity = 3000, LastMaintenance = DateTime.Parse("2024-04-15"), Type = VehicleType.FrontLoader, Latitude = "38.7169", Longitude = "-9.1399", DriverId = collaborators[0].Id },
				new() { LicensePlate = "11-AA-11", Status = "Active", RouteType = "Industrial", MaxCapacity = 4000, LastMaintenance = DateTime.Parse("2024-04-14"), Type = VehicleType.UrbanMini, Latitude = "38.7100", Longitude = "-9.1400", DriverId = collaborators[1].Id },
				new() { LicensePlate = "33-BB-33", Status = "Active", RouteType = "Commercial", MaxCapacity = 3500, LastMaintenance = DateTime.Parse("2024-04-13"), Type = VehicleType.SideLoader, Latitude = "38.7130", Longitude = "-9.1420", DriverId = collaborators[2].Id },
				new() { LicensePlate = "44-CC-44", Status = "Active", RouteType = "Industrial", MaxCapacity = 3200, LastMaintenance = DateTime.Parse("2024-04-12"), Type = VehicleType.RearLoader, Latitude = "38.7155", Longitude = "-9.1412", DriverId = collaborators[3].Id }
			};
			context.Vehicles.AddRange(vehicles);
			context.SaveChanges();

			// ───────────────────────────────
			// 3. BinLocations
			var locations = new BinLocation[]
			{
				new() { Latitude = "38.7169", Longitude = "-9.1399" },
				new() { Latitude = "38.7150", Longitude = "-9.1401" },
				new() { Latitude = "38.7175", Longitude = "-9.1415" },
				new() { Latitude = "38.7190", Longitude = "-9.1380" },
				new() { Latitude = "38.7182", Longitude = "-9.1370" },
				new() { Latitude = "38.7201", Longitude = "-9.1365" },
				new() { Latitude = "38.7215", Longitude = "-9.1350" },
				new() { Latitude = "38.7228", Longitude = "-9.1332" },
				new() { Latitude = "38.7240", Longitude = "-9.1320" }
			};
			context.BinLocations.AddRange(locations);
			context.SaveChanges();

			// ───────────────────────────────
			// 4. Bins
			var bins = new Bin[]
			{
				new() { Type = BinType.Recycling, Status = BinStatus.Active, Capacity = 2000, LastEmptied = DateTime.Parse("2024-04-10"), Location = locations[0] },
				new() { Type = BinType.General, Status = BinStatus.Active, Capacity = 1800, LastEmptied = DateTime.Parse("2024-04-09"), Location = locations[1] },
				new() { Type = BinType.Recycling, Status = BinStatus.Maintenance, Capacity = 2200, LastEmptied = DateTime.Parse("2024-04-08"), Location = locations[2] },
				new() { Type = BinType.General, Status = BinStatus.NotFunctional, Capacity = 2500, LastEmptied = DateTime.Parse("2024-04-07"), Location = locations[3] },
				new() { Type = BinType.Recycling, Status = BinStatus.Active, Capacity = 2100, LastEmptied = DateTime.Parse("2024-04-06"), Location = locations[4] },
				new() { Type = BinType.General, Status = BinStatus.NotFunctional, Capacity = 2000, LastEmptied = DateTime.Parse("2024-04-05"), Location = locations[5] },
				new() { Type = BinType.Recycling, Status = BinStatus.NotFunctional, Capacity = 1900, LastEmptied = DateTime.Parse("2024-04-04"), Location = locations[6] },
				new() { Type = BinType.General, Status = BinStatus.NotFunctional, Capacity = 2300, LastEmptied = DateTime.Parse("2024-04-03"), Location = locations[7] },
				new() { Type = BinType.Recycling, Status = BinStatus.NotFunctional, Capacity = 2100, LastEmptied = DateTime.Parse("2024-04-02"), Location = locations[8] }
			};
		
			context.Bins.AddRange(bins);
			context.SaveChanges();
		}
	}

}
