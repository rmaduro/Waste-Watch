using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WasteWatchAuth.Controllers;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;

namespace WasteWatchAuthTests
{
    public class CollectionHistoryControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly CollectionHistoryController _controller;

        public CollectionHistoryControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) 
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new CollectionHistoryController(_context);
        }

        [Fact]
        public async Task CreateCollection_ValidCollection_ReturnsCreated()
        {
            var history = new CollectionHistory
            {
                Id = 1,
                BinId = 1,
                AmountCollected = 10,
                Timestamp = DateTime.UtcNow, 
                IssuesLogged = "" 
            };

            var result = await _controller.CreateCollection(history);
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);

            var returnedHistory = Assert.IsType<CollectionHistory>(createdResult.Value);
            Assert.Equal(history.Id, returnedHistory.Id);
        }


        [Fact]
        public async Task GetAllCollections_ReturnsOk()
        {
            var collections = new List<CollectionHistory>
            {
                new CollectionHistory { Id = 1, BinId = 1, AmountCollected = 10 },
                new CollectionHistory { Id = 2, BinId = 2, AmountCollected = 20 }
            };

            _context.CollectionHistories.AddRange(collections);
            await _context.SaveChangesAsync();

            var result = await _controller.GetAllCollections();
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedCollections = Assert.IsType<List<CollectionHistory>>(okResult.Value);

            Assert.Equal(2, returnedCollections.Count);
        }

        [Fact]
        public async Task GetCollectionByBin_ExistingBin_ReturnsOk()
        {
            var collections = new List<CollectionHistory>
            {
                new CollectionHistory { Id = 1, BinId = 1, AmountCollected = 10 },
                new CollectionHistory { Id = 2, BinId = 1, AmountCollected = 20 }
            };

            _context.CollectionHistories.AddRange(collections);
            await _context.SaveChangesAsync();

            var result = await _controller.GetCollectionByBin(1);
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedCollections = Assert.IsType<List<CollectionHistory>>(okResult.Value);

            Assert.Equal(2, returnedCollections.Count);
        }

        [Fact]
        public async Task GetCollectionByBin_NonExistingBin_ReturnsNotFound()
        {
            var result = await _controller.GetCollectionByBin(99);
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task GetTotalCollections_ReturnsCorrectCount()
        {
            var collections = new List<CollectionHistory>
    {
        new CollectionHistory { Id = 1, BinId = 1, AmountCollected = 10, Timestamp = DateTime.UtcNow, IssuesLogged = "" },
        new CollectionHistory { Id = 2, BinId = 2, AmountCollected = 15, Timestamp = DateTime.UtcNow, IssuesLogged = "" }
    };

            _context.CollectionHistories.AddRange(collections);
            await _context.SaveChangesAsync();

            var result = await _controller.GetTotalCollections();
            var okResult = Assert.IsType<OkObjectResult>(result);

            var response = okResult.Value;

            var totalCollectionsProperty = response.GetType().GetProperty("totalCollections");
            Assert.NotNull(totalCollectionsProperty);

            var totalCollectionsValue = (int)totalCollectionsProperty.GetValue(response);
            Assert.Equal(2, totalCollectionsValue);
        }
    }
}
