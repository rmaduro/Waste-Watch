using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WasteWatchAuth.Controllers;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;
using Moq;

namespace WasteWatchAuthTests
{
    public class BinsControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly BinsController _controller;

        public BinsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new BinsController(_context);
        }

        [Fact]
        public async Task CreateBin_ValidBin_ReturnsOk()
        {
            var bin = new Bin { Id = 1, Location = new BinLocation(), Capacity = 100 };
            var result = await _controller.CreateBin(bin);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(bin, okResult.Value);
        }

        [Fact]
        public void GetAllBins_ReturnsOk()
        {
            var bins = new List<Bin>
            {
                new Bin { Id = 1, Location = new BinLocation(), Capacity = 100 },
                new Bin { Id = 2, Location = new BinLocation(), Capacity = 200 }
            };

            _context.Bins.AddRange(bins);
            _context.SaveChanges();

            var result = _controller.GetAllBins();
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedBins = Assert.IsType<List<Bin>>(okResult.Value);

            Assert.Equal(2, returnedBins.Count);
        }

        [Fact]
        public async Task GetBinById_BinExists_ReturnsOk()
        {
            var bin = new Bin { Id = 1, Location = new BinLocation(), Capacity = 100 };
            _context.Bins.Add(bin);
            _context.SaveChanges();

            var result = await _controller.GetBinById(1);
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(bin, okResult.Value);
        }

        [Fact]
        public async Task GetBinById_BinDoesNotExist_ReturnsNotFound()
        {
            var result = await _controller.GetBinById(1);
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteBin_BinExists_ReturnsNoContent()
        {
            var bin = new Bin { Id = 1, Location = new BinLocation(), Capacity = 100 };
            _context.Bins.Add(bin);
            _context.SaveChanges();

            var result = await _controller.DeleteBin(1);
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteBin_BinDoesNotExist_ReturnsNotFound()
        {
            var result = await _controller.DeleteBin(1);
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
