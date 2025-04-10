using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WasteWatchAuth.Controllers;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;
using Xunit;

namespace WasteWatchAuthTests
{
    public class RoutesControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly RoutesController _controller;

        public RoutesControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "RoutesTestDb")
                .Options;

            _context = new ApplicationDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _controller = new RoutesController(_context);
        }

        [Fact]
        public async Task CreateRoute_ValidRoute_ReturnsOk()
        {
            // Arrange
            var route = new Routes
            {
                Name = "Route A",
                Type = "Test route",
                Locations = new List<RouteLocation>
                {
                    new RouteLocation { Latitude = "38.7169", Longitude = "-9.1399", RouteId = 1 },
                    new RouteLocation { Latitude = "38.7170", Longitude = "-9.1400", RouteId = 2 }
                }
            };

            // Act
            var result = await _controller.CreateRoute(route);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedRoute = Assert.IsType<Routes>(okResult.Value);
            Assert.Equal("Route A", returnedRoute.Name);
            Assert.Equal(2, returnedRoute.Locations.Count);
        }

        [Fact]
        public async Task GetAllRoutes_ReturnsRoutes()
        {
            // Arrange
            var route = new Routes
            {
                Name = "Route B",
                Type = "Test route 2",
                Locations = new List<RouteLocation>
                {
                    new RouteLocation { Latitude = "38.7169", Longitude = "-9.1399", RouteId = 1 }
                }
            };

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetAllRoutes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var routes = Assert.IsType<List<Routes>>(okResult.Value);
            Assert.Single(routes);
        }

        [Fact]
        public async Task GetRouteById_ExistingId_ReturnsRoute()
        {
            // Arrange
            var route = new Routes
            {
                Name = "Route C",
                Type = "Test route 3",
                Locations = new List<RouteLocation>
                {
                    new RouteLocation { Latitude = "38.7200", Longitude = "-9.1500", RouteId = 1 }
                }
            };

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetRouteById(route.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedRoute = Assert.IsType<Routes>(okResult.Value);
            Assert.Equal("Route C", returnedRoute.Name);
        }

        [Fact]
        public async Task GetRouteById_NonExistingId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetRouteById(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteRoute_ExistingId_ReturnsNoContent()
        {
            // Arrange
            var route = new Routes
            {
                Name = "Route D",
                Type = "Test route 4",
                Locations = new List<RouteLocation>
                {
                    new RouteLocation { Latitude = "38.7250", Longitude = "-9.1600", RouteId = 1 }
                }
            };

            _context.Routes.Add(route);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.DeleteRoute(route.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteRoute_NonExistingId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.DeleteRoute(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
