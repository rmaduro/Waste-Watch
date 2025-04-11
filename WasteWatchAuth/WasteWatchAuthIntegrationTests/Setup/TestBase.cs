using System.Net.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using WasteWatchAuth.Data;
using Xunit;

namespace WasteWatchAuthIntegrationTests
{
	public class TestBase : IClassFixture<WebApplicationFactory<Program>>
	{
		protected readonly HttpClient _client;
		protected ApplicationDbContext _context; 

		public TestBase(WebApplicationFactory<Program> factory)
		{
			var webFactory = factory.WithWebHostBuilder(builder =>
			{
				builder.ConfigureServices(services =>
				{
					// Remover o contexto original
					var descriptor = services.SingleOrDefault(
						d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

					if (descriptor != null)
						services.Remove(descriptor);

					// Adicionar contexto InMemory
					services.AddDbContext<ApplicationDbContext>(options =>
						options.UseInMemoryDatabase("TestDB"));

					// Construir o serviço
					var sp = services.BuildServiceProvider();

					using var scope = sp.CreateScope();
					var scopedServices = scope.ServiceProvider;
					_context = scopedServices.GetRequiredService<ApplicationDbContext>();
					_context.Database.EnsureCreated();
				});
			});

			_client = webFactory.CreateClient();
		}
	}
}