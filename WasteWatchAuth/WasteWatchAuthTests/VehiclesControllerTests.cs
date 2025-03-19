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
            var vehicle = new Vehicle { LicensePlate = "ABC-123", Driver = new Collaborator { Name = "John Doe", Age = 30, LicenseNumber = "XYZ789" } };
            var result = await _controller.CreateVehicle(vehicle);
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetAllVehicles_ReturnsVehicles()
        {
            _context.Vehicles.Add(new Vehicle { LicensePlate = "ABC-123", Driver = new Collaborator { Name = "John Doe", Age = 30, LicenseNumber = "XYZ789" } });
            await _context.SaveChangesAsync();
            var result = await _controller.GetAllVehicles();
            var okResult = Assert.IsType<OkObjectResult>(result);
            var vehicles = Assert.IsType<List<Vehicle>>(okResult.Value);
            Assert.Single(vehicles);
        }

        [Fact]
        public async Task GetVehicleById_ExistingId_ReturnsVehicle()
        {
            var vehicle = new Vehicle { LicensePlate = "ABC-123", Driver = new Collaborator { Name = "John Doe", Age = 30, LicenseNumber = "XYZ789" } };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            var result = await _controller.GetVehicleById(vehicle.Id);
            Assert.IsType<OkObjectResult>(result);
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
            var vehicle = new Vehicle { LicensePlate = "ABC-123", Driver = new Collaborator { Name = "John Doe", Age = 30, LicenseNumber = "XYZ789" } };
            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();
            var result = await _controller.DeleteVehicle(vehicle.Id);
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
