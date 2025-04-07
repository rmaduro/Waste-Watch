using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WasteWatchAuth.Controllers;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;
using Xunit;

namespace WasteWatchAuthTests
{
    public class VehiclesControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly VehiclesController _controller;

        public VehiclesControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();
            _controller = new VehiclesController(_context);
        }

        [Fact]
        public async Task CreateVehicle_ValidVehicle_ReturnsOk()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                LicensePlate = "ABC-123",
                Type = VehicleType.FrontLoader,
                Status = "Active",
                RouteType = "Commercial",
                MaxCapacity = 3000,
                LastMaintenance = DateTime.UtcNow,
                Latitude = "38.7169",
                Longitude = "-9.1399",
                Driver = new Collaborator
                {
                    Name = "John Doe",
                    Age = 30,
                    LicenseNumber = "XYZ789",
                    CollaboratorType = CollaboratorType.Driver
                }
            };

            // Act
            var result = await _controller.CreateVehicle(vehicle);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedVehicle = Assert.IsType<Vehicle>(okResult.Value);
            Assert.Equal("ABC-123", returnedVehicle.LicensePlate);
        }


        [Fact]
        public async Task GetAllVehicles_ReturnsVehicles()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                LicensePlate = "ABC-123",
                Type = VehicleType.FrontLoader,
                Status = "Active",
                RouteType = "Commercial",
                MaxCapacity = 3000,
                LastMaintenance = DateTime.UtcNow,
                Latitude = "38.7169",
                Longitude = "-9.1399",
                Driver = new Collaborator
                {
                    Name = "John Doe",
                    Age = 30,
                    LicenseNumber = "XYZ789",
                    CollaboratorType = CollaboratorType.Driver
                }
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAllVehicles();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var vehicles = Assert.IsType<List<Vehicle>>(okResult.Value);
            Assert.Single(vehicles);
        }


        [Fact]
        public async Task GetVehicleById_ExistingId_ReturnsVehicle()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                LicensePlate = "ABC-123",
                Type = VehicleType.FrontLoader,
                Status = "Active",
                RouteType = "Commercial",
                MaxCapacity = 3000,
                LastMaintenance = DateTime.UtcNow,
                Latitude = "38.7169",
                Longitude = "-9.1399",
                Driver = new Collaborator
                {
                    Name = "John Doe",
                    Age = 30,
                    LicenseNumber = "XYZ789",
                    CollaboratorType = CollaboratorType.Driver
                }
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetVehicleById(vehicle.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedVehicle = Assert.IsType<Vehicle>(okResult.Value);
            Assert.Equal(vehicle.LicensePlate, returnedVehicle.LicensePlate);
        }


        [Fact]
        public async Task GetVehicleById_NonExistingId_ReturnsNotFound()
        {
            var result = await _controller.GetVehicleById(999);
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteVehicle_ExistingId_ReturnsNoContent()
        {
            // Arrange
            var vehicle = new Vehicle
            {
                LicensePlate = "ABC-123",
                Type = VehicleType.FrontLoader,
                Status = "Active",
                RouteType = "Commercial",
                MaxCapacity = 3000,
                LastMaintenance = DateTime.UtcNow,
                Latitude = "38.7169",
                Longitude = "-9.1399",
                Driver = new Collaborator
                {
                    Name = "John Doe",
                    Age = 30,
                    LicenseNumber = "XYZ789",
                    CollaboratorType = CollaboratorType.Driver
                }
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteVehicle(vehicle.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }


        [Fact]
        public async Task DeleteVehicle_NonExistingId_ReturnsNotFound()
        {
            var result = await _controller.DeleteVehicle(999);
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
