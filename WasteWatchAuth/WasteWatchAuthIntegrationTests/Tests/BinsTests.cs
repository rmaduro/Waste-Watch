using System.Net.Http.Json;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using WasteWatchAuth.Models;

public class BinsTests : IClassFixture<CustomWebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public BinsTests(CustomWebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostBin_ShouldCreateBin()
    {
        // Arrange
        var bin = new Bin
        {
            Type = BinType.Recycling,
            Status = BinStatus.Active,
            Capacity = 2000,
            CurrentFillLevel = 0,
            Location = new BinLocation
            {
                Latitude = "38.7169",
                Longitude = "-9.1399"
            }
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/bins", bin);

        // Assert
        response.EnsureSuccessStatusCode();
        var created = await response.Content.ReadFromJsonAsync<Bin>();
        created.Should().NotBeNull();
        created!.Capacity.Should().Be(2000);
    }
}