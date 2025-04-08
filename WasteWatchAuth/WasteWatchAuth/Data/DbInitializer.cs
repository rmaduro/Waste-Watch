using WasteWatchAuth.Models;

namespace WasteWatchAuth.Data
{
	public class DbInitializer
	{
		public static void Initialize(ApplicationDbContext context)
		{
			// Aplicar migrações automaticamente (opcional)
			context.Database.EnsureCreated();

			// Se já existirem registos, não faz nada
			if (context.Bins.Any()) return;

			// ─────────────────────────────────────────────────────────
			// 1. Collaborators (Drivers)
			var collaborators = new Collaborator[]
			{
                // Dados originais
                new() { Name = "Carlos Silva", Age = 40, LicenseNumber = "ABC-12345", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Ana Ribeiro", Age = 35, LicenseNumber = "DEF-67890", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "João Costa", Age = 45, LicenseNumber = "GHI-98765", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Marta Dias", Age = 38, LicenseNumber = "JKL-11223", CollaboratorType = CollaboratorType.Driver },

                // Dados adicionais
                new() { Name = "Bruno Marques", Age = 42, LicenseNumber = "LMN-44444", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Carla Pinto", Age = 33, LicenseNumber = "OPQ-55555", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Ricardo Santos", Age = 50, LicenseNumber = "RST-66666", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Sofia Rocha", Age = 29, LicenseNumber = "UVW-77777", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Paulo Fonseca", Age = 36, LicenseNumber = "XYZ-88888", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Diana Moutinho", Age = 41, LicenseNumber = "XXL-99999", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Fábio Antunes", Age = 27, LicenseNumber = "FAG-12399", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Sara Gonçalves", Age = 32, LicenseNumber = "GBK-48151", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Luís Faria", Age = 39, LicenseNumber = "AKI-12888", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Rita Carvalho", Age = 45, LicenseNumber = "HIF-92222", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Tomás Coelho", Age = 28, LicenseNumber = "IJF-70007", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Mariana Lopes", Age = 44, LicenseNumber = "BBA-99111", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Tiago Rodrigues", Age = 31, LicenseNumber = "CCD-88812", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Patrícia Freitas", Age = 37, LicenseNumber = "TTT-12344", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Vera Martins", Age = 42, LicenseNumber = "XYZ-99977", CollaboratorType = CollaboratorType.Driver },
				new() { Name = "Rafael Pires", Age = 34, LicenseNumber = "ABC-22233", CollaboratorType = CollaboratorType.Driver },
			};
			context.Collaborators.AddRange(collaborators);
			context.SaveChanges();

			// ─────────────────────────────────────────────────────────
			// 2. Vehicles
			// Usaremos rotativamente os ids dos colaboradores criados acima
			var allCollabs = collaborators.ToList();
			var vehicles = new List<Vehicle>();
			var routeTypes = new[] { "Commercial", "Industrial", "Mixed" };
			var vehicleTypes = new[] { VehicleType.FrontLoader, VehicleType.SideLoader, VehicleType.RearLoader, VehicleType.UrbanMini };

			for (int i = 0; i < 20; i++)
			{
				vehicles.Add(new Vehicle
				{
					LicensePlate = $"{i:D2}-XX-{(i + 10):D2}",
					Status = "Active",
					RouteType = routeTypes[i % routeTypes.Length],
					MaxCapacity = 3000 + (i * 100),
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-i),
					Type = vehicleTypes[i % vehicleTypes.Length],
					Latitude = $"38.7{i % 10}9",
					Longitude = $"-9.13{i % 10}9",
					// Escolhe um driver de forma aleatória
					DriverId = allCollabs[i % allCollabs.Count].Id
				});
			}
			context.Vehicles.AddRange(vehicles);
			context.SaveChanges();

			// ─────────────────────────────────────────────────────────
			// 3. BinLocations (aprox. Lisboa / Setúbal)
			// Geraremos 20 localizações diferentes
			var binLocations = new BinLocation[]
			{
				new() { Latitude = "38.5245", Longitude = "-8.8880" },
				new() { Latitude = "38.5201", Longitude = "-8.8965" },
				new() { Latitude = "38.5228", Longitude = "-8.8972" },
				new() { Latitude = "38.5250", Longitude = "-8.8941" },
				new() { Latitude = "38.5282", Longitude = "-8.8905" },
				new() { Latitude = "38.5301", Longitude = "-8.8892" },
				new() { Latitude = "38.5331", Longitude = "-8.8912" },
				new() { Latitude = "38.5370", Longitude = "-8.8935" },
				new() { Latitude = "38.5402", Longitude = "-8.8950" },
				new() { Latitude = "38.7080", Longitude = "-9.1350" },
				new() { Latitude = "38.7101", Longitude = "-9.1390" },
				new() { Latitude = "38.7125", Longitude = "-9.1330" },
				new() { Latitude = "38.7165", Longitude = "-9.1405" },
				new() { Latitude = "38.7189", Longitude = "-9.1420" },
				new() { Latitude = "38.7200", Longitude = "-9.1410" },
				new() { Latitude = "38.7222", Longitude = "-9.1388" },
				new() { Latitude = "38.7251", Longitude = "-9.1367" },
				new() { Latitude = "38.7283", Longitude = "-9.1349" },
				new() { Latitude = "38.7304", Longitude = "-9.1301" },
				new() { Latitude = "38.7332", Longitude = "-9.1250" }
			};
			context.BinLocations.AddRange(binLocations);
			context.SaveChanges();

			// ─────────────────────────────────────────────────────────
			// 4. Bins
			// Vamos criar 20 lixeiras (bins), cada uma ligada a uma das 20 localizações
			var binTypes = new[] { BinType.Recycling, BinType.General };
			var binStatuses = new[] { BinStatus.Active, BinStatus.Maintenance, BinStatus.NotFunctional };

			var bins = new List<Bin>();
			for (int i = 0; i < binLocations.Length; i++)
			{
				bins.Add(new Bin
				{
					Type = binTypes[i % binTypes.Length],
					Status = binStatuses[i % binStatuses.Length],
					Capacity = 1800 + (i * 50),
					LastEmptied = DateTime.Today.AddDays(-i),
					Location = binLocations[i]
				});
			}
			context.Bins.AddRange(bins);
			context.SaveChanges();
		}
	}
}
