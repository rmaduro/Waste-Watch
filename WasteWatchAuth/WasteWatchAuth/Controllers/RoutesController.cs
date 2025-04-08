using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class RoutesController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public RoutesController(ApplicationDbContext context)
		{
			_context = context;
		}

		/// <summary>
		/// Criar uma nova rota com localizações.
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateRoute([FromBody] Routes route)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			_context.Routes.Add(route);
			await _context.SaveChangesAsync();

			return Ok(route);
		}

		/// <summary>
		/// Obter todas as rotas.
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetAllRoutes()
		{
			var routes = await _context.Routes
				// Agora, apenas inclua as Locations
				.Include(r => r.Locations)
				.ToListAsync();

			return Ok(routes);
		}

		/// <summary>
		/// Obter uma rota específica por ID.
		/// </summary>
		[HttpGet("{id}")]
		public async Task<IActionResult> GetRouteById(int id)
		{
			var route = await _context.Routes
				.Include(r => r.Locations)
				.FirstOrDefaultAsync(r => r.Id == id);

			if (route == null)
				return NotFound();

			return Ok(route);
		}

		/// <summary>
		/// Eliminar uma rota.
		/// </summary>
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteRoute(int id)
		{
			var route = await _context.Routes
				.Include(r => r.Locations)
				.FirstOrDefaultAsync(r => r.Id == id);

			if (route == null)
				return NotFound();

			// Remover localizações associadas
			_context.RouteLocations.RemoveRange(route.Locations);
			_context.Routes.Remove(route);

			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}
