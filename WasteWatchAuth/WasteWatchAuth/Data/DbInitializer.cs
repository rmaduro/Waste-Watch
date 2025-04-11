using WasteWatchAuth.Models;

namespace WasteWatchAuth.Data
{
	/// <summary>
	/// Provides initial seed data for the application database.
	/// This class populates tables such as Collaborators, Vehicles, BinLocations, Bins,
	/// CollectionHistories, and MaintenanceHistories with sample data.
	/// </summary>
	public class DbInitializer
	{
		public static void Initialize(ApplicationDbContext context)
		{
			// Aplicar migrações automaticamente (opcional)
			context.Database.EnsureCreated();

			// Se já existirem registros de Bin, entendemos que já foi inicializado
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
			// 2. Vehicles (20 registros estáticos)
			var allCollabs = collaborators.ToList();
			var vehicles = new Vehicle[]
			{
				// ───── 10 em Lisboa ─────────────────
				new()
				{
					LicensePlate = "01-XX-11",
					Status = "Active",
					RouteType = "Commercial",
					MaxCapacity = 3000,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-1),
					Type = VehicleType.FrontLoader,
					Latitude = "38.7213",
					Longitude = "-9.1393",
					DriverId = allCollabs[0].Id
				},
				new()
				{
					LicensePlate = "02-XX-22",
					Status = "Active",
					RouteType = "Industrial",
					MaxCapacity = 3100,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-2),
					Type = VehicleType.SideLoader,
					Latitude = "38.7224",
					Longitude = "-9.1401",
					DriverId = allCollabs[1].Id
				},
				new()
				{
					LicensePlate = "03-XX-33",
					Status = "Active",
					RouteType = "Mixed",
					MaxCapacity = 3200,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-3),
					Type = VehicleType.RearLoader,
					Latitude = "38.7232",
					Longitude = "-9.1356",
					DriverId = allCollabs[2].Id
				},
				new()
				{
					LicensePlate = "04-XX-44",
					Status = "Active",
					RouteType = "Commercial",
					MaxCapacity = 3300,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-4),
					Type = VehicleType.UrbanMini,
					Latitude = "38.7257",
					Longitude = "-9.1305",
					DriverId = allCollabs[3].Id
				},
				new()
				{
					LicensePlate = "05-XX-55",
					Status = "Active",
					RouteType = "Industrial",
					MaxCapacity = 3400,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-5),
					Type = VehicleType.FrontLoader,
					Latitude = "38.7290",
					Longitude = "-9.1284",
					DriverId = allCollabs[4].Id
				},
				new()
				{
					LicensePlate = "06-XX-66",
					Status = "Active",
					RouteType = "Mixed",
					MaxCapacity = 3500,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-6),
					Type = VehicleType.SideLoader,
					Latitude = "38.7150",
					Longitude = "-9.1401",
					DriverId = allCollabs[5].Id
				},
				new()
				{
					LicensePlate = "07-XX-77",
					Status = "Active",
					RouteType = "Commercial",
					MaxCapacity = 3600,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-7),
					Type = VehicleType.RearLoader,
					Latitude = "38.7169",
					Longitude = "-9.1399",
					DriverId = allCollabs[6].Id
				},
				new()
				{
					LicensePlate = "08-XX-88",
					Status = "Active",
					RouteType = "Industrial",
					MaxCapacity = 3700,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-8),
					Type = VehicleType.UrbanMini,
					Latitude = "38.7175",
					Longitude = "-9.1415",
					DriverId = allCollabs[7].Id
				},
				new()
				{
					LicensePlate = "09-XX-99",
					Status = "Active",
					RouteType = "Mixed",
					MaxCapacity = 3800,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-9),
					Type = VehicleType.FrontLoader,
					Latitude = "38.7201",
					Longitude = "-9.1365",
					DriverId = allCollabs[8].Id
				},
				new()
				{
					LicensePlate = "10-XX-10",
					Status = "Active",
					RouteType = "Commercial",
					MaxCapacity = 3900,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-10),
					Type = VehicleType.SideLoader,
					Latitude = "38.7240",
					Longitude = "-9.1320",
					DriverId = allCollabs[9].Id
				},

				// ───── 10 em Setúbal ─────────────────
				new()
				{
					LicensePlate = "11-YY-11",
					Status = "Active",
					RouteType = "Industrial",
					MaxCapacity = 3000,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-11),
					Type = VehicleType.RearLoader,
					Latitude = "38.5245",
					Longitude = "-8.8880",
					DriverId = allCollabs[10].Id
				},
				new()
				{
					LicensePlate = "12-YY-22",
					Status = "Active",
					RouteType = "Mixed",
					MaxCapacity = 3100,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-12),
					Type = VehicleType.UrbanMini,
					Latitude = "38.5201",
					Longitude = "-8.8965",
					DriverId = allCollabs[11].Id
				},
				new()
				{
					LicensePlate = "13-YY-33",
					Status = "Active",
					RouteType = "Commercial",
					MaxCapacity = 3200,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-13),
					Type = VehicleType.FrontLoader,
					Latitude = "38.5228",
					Longitude = "-8.8972",
					DriverId = allCollabs[12].Id
				},
				new()
				{
					LicensePlate = "14-YY-44",
					Status = "Active",
					RouteType = "Industrial",
					MaxCapacity = 3300,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-14),
					Type = VehicleType.SideLoader,
					Latitude = "38.5250",
					Longitude = "-8.8941",
					DriverId = allCollabs[13].Id
				},
				new()
				{
					LicensePlate = "15-YY-55",
					Status = "Active",
					RouteType = "Mixed",
					MaxCapacity = 3400,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-15),
					Type = VehicleType.RearLoader,
					Latitude = "38.5282",
					Longitude = "-8.8905",
					DriverId = allCollabs[14].Id
				},
				new()
				{
					LicensePlate = "16-YY-66",
					Status = "Active",
					RouteType = "Commercial",
					MaxCapacity = 3500,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-16),
					Type = VehicleType.UrbanMini,
					Latitude = "38.5301",
					Longitude = "-8.8892",
					DriverId = allCollabs[15].Id
				},
				new()
				{
					LicensePlate = "17-YY-77",
					Status = "Active",
					RouteType = "Industrial",
					MaxCapacity = 3600,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-17),
					Type = VehicleType.FrontLoader,
					Latitude = "38.5331",
					Longitude = "-8.8912",
					DriverId = allCollabs[16].Id
				},
				new()
				{
					LicensePlate = "18-YY-88",
					Status = "Active",
					RouteType = "Mixed",
					MaxCapacity = 3700,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-18),
					Type = VehicleType.SideLoader,
					Latitude = "38.5370",
					Longitude = "-8.8935",
					DriverId = allCollabs[17].Id
				},
				new()
				{
					LicensePlate = "19-YY-99",
					Status = "Active",
					RouteType = "Commercial",
					MaxCapacity = 3800,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-19),
					Type = VehicleType.RearLoader,
					Latitude = "38.5402",
					Longitude = "-8.8950",
					DriverId = allCollabs[18].Id
				},
				new()
				{
					LicensePlate = "20-YY-10",
					Status = "Active",
					RouteType = "Industrial",
					MaxCapacity = 3900,
					LastMaintenance = DateTime.Parse("2024-04-15").AddDays(-20),
					Type = VehicleType.UrbanMini,
					Latitude = "38.5440",
					Longitude = "-8.8870",
					DriverId = allCollabs[19].Id
				},
			};

			context.Vehicles.AddRange(vehicles);
			context.SaveChanges();

			// ─────────────────────────────────────────────────────────
			// 3. BinLocations (aprox. Lisboa / Setúbal) - 20 localizações
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
			// 4. Bins (20 lixeiras - 1 para cada BinLocation)
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

			// ─────────────────────────────────────────────────────────
			// 5. CollectionHistory (20 registos aleatórios)
			var allBins = context.Bins.ToList();
			var allVehiclesInDb = context.Vehicles.ToList();

			if (allBins.Count > 0 && allVehiclesInDb.Count > 0)
			{
				var rnd = new Random();
				var statuses = new[] { CollectionStatus.Completed, CollectionStatus.Pending, CollectionStatus.Failed };
				var issueMessages = new[]
				{
					"",
					"Nenhum problema registrado.",
					"Obstrução leve na área.",
					"Tampão quebrado.",
					"Reclamação de mau cheiro.",
					"Deslocamento atrasado por trânsito."
				};

				var historyList = new List<CollectionHistory>();

				for (int i = 0; i < 20; i++)
				{
					var randomBin = allBins[rnd.Next(allBins.Count)];
					var randomVehicle = allVehiclesInDb[rnd.Next(allVehiclesInDb.Count)];

					// Gera uma data aleatória nos últimos 30 dias
					var daysAgo = rnd.Next(30); // 0..29
					var randomDate = DateTime.Now
						.AddDays(-daysAgo)
						.AddHours(rnd.Next(24))
						.AddMinutes(rnd.Next(60));

					var status = statuses[rnd.Next(statuses.Length)];
					var issue = issueMessages[rnd.Next(issueMessages.Length)];

					// Gera uma quantidade entre 0 e 300 (em kg, por exemplo)
					var amount = Math.Round(rnd.NextDouble() * 300, 1);

					historyList.Add(new CollectionHistory
					{
						BinId = randomBin.Id,
						VehicleId = randomVehicle.Id,
						Timestamp = randomDate,
						CollectionStatus = status,
						IssuesLogged = issue,
						AmountCollected = amount
					});
				}

				context.CollectionHistories.AddRange(historyList);
				context.SaveChanges();
			}

			// ─────────────────────────────────────────────────────────
			// 6. MaintenanceHistory (20 registos aleatórios)
			var allBinsForMaint = context.Bins.ToList();

			if (allBinsForMaint.Count > 0)
			{
				var rnd = new Random();

				// Possíveis tipos de manutenção
				var maintenanceTypes = new[] { "Repair", "Replacement", "Inspection" };
				// Exemplos de descrições
				var descriptions = new[]
				{
					"",
					"Substituição da tampa danificada.",
					"Limpeza interna do contentor.",
					"Tampa travada, substituída a dobradiça.",
				};

				var maintHistoryList = new List<MaintenanceHistory>();

				for (int i = 0; i < 20; i++)
				{
					var randomBin = allBinsForMaint[rnd.Next(allBinsForMaint.Count)];

					// Início da manutenção nos últimos 30 dias
					var daysAgo = rnd.Next(30);
					var startDate = DateTime.UtcNow
						.AddDays(-daysAgo)
						.AddHours(rnd.Next(24))
						.AddMinutes(rnd.Next(60));

					// Em ~metade dos casos, gera um EndDate
					DateTime? endDate = null;
					if (rnd.Next(2) == 0) // 0 ou 1
					{
						// Entre 1 e 48 horas após o início
						var hoursAfter = rnd.Next(1, 48);
						endDate = startDate.AddHours(hoursAfter);
					}

					var mType = maintenanceTypes[rnd.Next(maintenanceTypes.Length)];
					var desc = descriptions[rnd.Next(descriptions.Length)];
					// Exemplo de UserId aleatório (6 dígitos)
					var userId = rnd.Next(100000, 999999).ToString();

					maintHistoryList.Add(new MaintenanceHistory
					{
						BinId = randomBin.Id,
						UserId = userId,
						StartDate = startDate,
						EndDate = endDate,
						MaintenanceType = mType,
						Description = desc
					});
				}

				// ─────────────────────────────────────────────────────────
				// 7.

				var fleetNotifications = new Notification[]
				{
					new()
					{
						Title = "Manutenção Programada",
						Message = "O veículo 44-CC-44 foi agendado para manutenção.",
						CreatedAt = DateTime.Parse("2025-04-09T02:07:23.6168925Z"),
						Type = "Fleet",
						ReferenceId = 1
					},
					new()
					{
						Title = "Verificação de Óleo",
						Message = "O veículo 55-DD-55 necessita de verificação de óleo.",
						CreatedAt = DateTime.Parse("2025-04-09T03:15:00Z"),
						Type = "Fleet",
						ReferenceId = 2
					},
					new()
					{
						Title = "Inspeção Técnica",
						Message = "O veículo 66-EE-66 passou na inspeção técnica.",
						CreatedAt = DateTime.Parse("2025-04-09T09:45:13Z"),
						Type = "Fleet",
						ReferenceId = 3
					},
					new()
					{
						Title = "Problema de Travões",
						Message = "Foi detetado um problema nos travões do veículo 77-FF-77.",
						CreatedAt = DateTime.Parse("2025-04-09T10:30:00Z"),
						Type = "Fleet",
						ReferenceId = 4
					},
					new()
					{
						Title = "Revisão Geral",
						Message = "O veículo 88-GG-88 está em revisão completa.",
						CreatedAt = DateTime.Parse("2025-04-09T11:00:00Z"),
						Type = "Fleet",
						ReferenceId = 5
					}
				};
				context.Notifications.AddRange(fleetNotifications);


				// ─────────────────────────────────────────────────────────
				// 8.
				var binNotifications = new Notification[]
				{
					new()
					{
						Title = "Contentor Cheio",
						Message = "O contentor junto ao Mercado Central está quase cheio (85%).",
						CreatedAt = DateTime.Parse("2025-04-09T02:14:13.1928653Z"),
						Type = "Bin",
						ReferenceId = 3
					},
					new()
					{
						Title = "Danos Visíveis",
						Message = "Contentor nº 4 apresenta danos na tampa.",
						CreatedAt = DateTime.Parse("2025-04-09T07:32:12Z"),
						Type = "Bin",
						ReferenceId = 4
					},
					new()
					{
						Title = "Localização Atualizada",
						Message = "O contentor nº 5 foi movido para a Rua Nova.",
						CreatedAt = DateTime.Parse("2025-04-09T08:00:00Z"),
						Type = "Bin",
						ReferenceId = 5
					},
					new()
					{
						Title = "Incêndio Detetado",
						Message = "Alerta: Possível incêndio no contentor nº 6.",
						CreatedAt = DateTime.Parse("2025-04-09T08:45:00Z"),
						Type = "Bin",
						ReferenceId = 6
					},
					new()
					{
						Title = "Vandalismo Reportado",
						Message = "Vandalismo reportado no contentor nº 7.",
						CreatedAt = DateTime.Parse("2025-04-09T09:10:00Z"),
						Type = "Bin",
						ReferenceId = 7
					}
				};
				context.Notifications.AddRange(binNotifications);


				context.MaintenanceHistories.AddRange(maintHistoryList);
				context.SaveChanges();
			}
		}
	}
}
