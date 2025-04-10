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
		/// Creates a new route with associated locations.
		/// </summary>
		/// <param name="route">The route object to be created.</param>
		/// <returns>The newly created route or validation errors.</returns>
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
		/// Retrieves all routes with their associated locations.
		/// </summary>
		/// <returns>A list of all routes.</returns>
		[HttpGet]
		public async Task<IActionResult> GetAllRoutes()
		{
			var routes = await _context.Routes
				.Include(r => r.Locations)
				.ToListAsync();

			return Ok(routes);
		}

		/// <summary>
		/// Retrieves a specific route by its ID.
		/// </summary>
		/// <param name="id">The ID of the route.</param>
		/// <returns>The route with the given ID or NotFound if it does not exist.</returns>
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
		/// Deletes a route and its associated locations by route ID.
		/// </summary>
		/// <param name="id">The ID of the route to delete.</param>
		/// <returns>NoContent if successfully deleted, NotFound if the route does not exist.</returns>
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteRoute(int id)
		{
			var route = await _context.Routes
				.Include(r => r.Locations)
				.FirstOrDefaultAsync(r => r.Id == id);

			if (route == null)
				return NotFound();

			// Remove the associated locations first
			_context.RouteLocations.RemoveRange(route.Locations);
			_context.Routes.Remove(route);

			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}
