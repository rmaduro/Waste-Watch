using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WasteWatchAuth.Controllers;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;
using Xunit;

namespace WasteWatchAuthTests
{
    public class NotificationsControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly NotificationsController _controller;

        public NotificationsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "NotificationsTestDb")
                .Options;

            _context = new ApplicationDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _controller = new NotificationsController(_context);
        }

        [Fact]
        public async Task CreateNotification_ValidNotification_ReturnsOk()
        {
            // Arrange
            var notification = new Notification
            {
                Title = "Bin Full",
                Message = "Bin 101 is full",
                Type = "Bin",
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var result = await _controller.CreateNotification(notification);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedNotification = Assert.IsType<Notification>(okResult.Value);
            Assert.Equal("Bin Full", returnedNotification.Title);
        }

        [Fact]
        public async Task GetBinNotifications_ReturnsOnlyBinType()
        {
            // Arrange
            var binNotification = new Notification
            {
                Title = "Bin 1 Full",
                Message = "Bin 1 overflow",
                Type = "Bin",
                CreatedAt = DateTime.UtcNow
            };

            var fleetNotification = new Notification
            {
                Title = "Vehicle Check",
                Message = "Truck 2 needs maintenance",
                Type = "Fleet",
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.AddRange(binNotification, fleetNotification);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetBinNotifications();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var notifications = Assert.IsType<List<Notification>>(okResult.Value);
            Assert.Single(notifications);
            Assert.Equal("Bin", notifications[0].Type);
        }

        [Fact]
        public async Task GetFleetNotifications_ReturnsOnlyFleetType()
        {
            // Arrange
            var fleetNotification1 = new Notification
            {
                Title = "Truck Issue",
                Message = "Engine warning light on",
                Type = "Fleet",
                CreatedAt = DateTime.UtcNow
            };

            var binNotification = new Notification
            {
                Title = "Overflow",
                Message = "Bin 3 full",
                Type = "Bin",
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.AddRange(fleetNotification1, binNotification);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetFleetNotifications();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var notifications = Assert.IsType<List<Notification>>(okResult.Value);
            Assert.Single(notifications);
            Assert.Equal("Fleet", notifications[0].Type);
        }
    }
}
