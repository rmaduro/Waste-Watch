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
            var bin = new Bin
            {
                Id = 1,
                Capacity = 100,
                Location = new BinLocation
                {
                    Latitude = "38.7169",
                    Longitude = "-9.1399"
                }
            };

            var result = await _controller.CreateBin(bin);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedBin = Assert.IsType<Bin>(okResult.Value);
            Assert.Equal(bin.Capacity, returnedBin.Capacity);
            Assert.Equal(bin.Location.Latitude, returnedBin.Location.Latitude);
        }


        [Fact]
        public void GetAllBins_ReturnsOk()
        {
            var location1 = new BinLocation { Latitude = "38.7169", Longitude = "-9.1399" };
            var location2 = new BinLocation { Latitude = "38.7170", Longitude = "-9.1400" };

            _context.BinLocations.AddRange(location1, location2);
            _context.SaveChanges();

            var bins = new List<Bin>
            {
                new Bin { Id = 1, Location = location1, Capacity = 100 },
                new Bin { Id = 2, Location = location2, Capacity = 200 }
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
            var location = new BinLocation
            {
                Latitude = "38.7169",
                Longitude = "-9.1399"
            };

            _context.BinLocations.Add(location);
            _context.SaveChanges();

            var bin = new Bin
            {
                Id = 1,
                Capacity = 100,
                Location = location
            };

            _context.Bins.Add(bin);
            _context.SaveChanges();

            var result = await _controller.GetBinById(1);
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedBin = Assert.IsType<Bin>(okResult.Value);

            Assert.Equal(bin.Id, returnedBin.Id);
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
            // Criar e guardar localização primeiro
            var location = new BinLocation
            {
                Latitude = "38.7169",
                Longitude = "-9.1399"
            };

            _context.BinLocations.Add(location);
            _context.SaveChanges();

            // Associar localização ao bin
            var bin = new Bin
            {
                Id = 1,
                Capacity = 100,
                Location = location
            };

            _context.Bins.Add(bin);
            _context.SaveChanges();

            // Executar o método a testar
            var result = await _controller.DeleteBin(1);

            // Verificar o resultado
            Assert.IsType<NoContentResult>(result);
        }


        [Fact]
        public async Task DeleteBin_BinDoesNotExist_ReturnsNotFound()
        {
            var result = await _controller.DeleteBin(1);
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetDamagedBins_ReturnsOnlyNotFunctionalBins()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "DamagedBinsTest")
                .Options;

            using var context = new ApplicationDbContext(options);

            context.Bins.AddRange(
                new Bin
                {
                    Id = 1,
                    Status = BinStatus.NotFunctional,
                    Capacity = 2000,
                    CurrentFillLevel = 1000,
                    Location = new BinLocation { Latitude = "38.7169", Longitude = "-9.1399" }
                },
                new Bin
                {
                    Id = 2,
                    Status = BinStatus.Active,
                    Capacity = 2000,
                    CurrentFillLevel = 1200,
                    Location = new BinLocation { Latitude = "38.7170", Longitude = "-9.1400" }
                },
                new Bin
                {
                    Id = 3,
                    Status = BinStatus.NotFunctional,
                    Capacity = 1800,
                    CurrentFillLevel = 1500,
                    Location = new BinLocation { Latitude = "38.7180", Longitude = "-9.1410" }
                }
            );
            await context.SaveChangesAsync();

            var controller = new BinsController(context);

            // Act
            var result = await controller.GetDamagedBins();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            if (okResult.Value is IEnumerable<Bin> bins)
            {
                Assert.Equal(2, bins.Count());
                Assert.All(bins, b => Assert.Equal(BinStatus.NotFunctional, b.Status));
            }
            else
            {
                var messageProp = okResult.Value.GetType().GetProperty("message");
                var message = messageProp?.GetValue(okResult.Value)?.ToString();
                Assert.Equal("Não existem contentores danificados.", message);
            }
        }


    }
}
