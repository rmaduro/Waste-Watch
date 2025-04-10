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
	public class VehiclesController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public VehiclesController(ApplicationDbContext context)
		{
			_context = context;
		}

		/// <summary>
		/// Creates a new vehicle and assigns a driver (collaborator of type Driver).
		/// </summary>
		/// <param name="vehicle">The vehicle object containing vehicle and driver information.</param>
		/// <returns>A newly created vehicle or an error message.</returns>
		[HttpPost]
		public async Task<IActionResult> CreateVehicle([FromBody] Vehicle vehicle)
		{
			if (vehicle == null || vehicle.Driver == null)
				return BadRequest("Invalid vehicle or driver data.");

			// Check if a vehicle with the same license plate already exists
			bool exists = await _context.Vehicles.AnyAsync(v => v.LicensePlate == vehicle.LicensePlate);
			if (exists)
				return Conflict(new { message = "A vehicle with this license plate already exists." });

			// Check if the driver (collaborator) already exists in the database
			var existingCollaborator = await _context.Collaborators
				.FirstOrDefaultAsync(c => c.LicenseNumber == vehicle.Driver.LicenseNumber);

			if (existingCollaborator == null)
			{
				// Create a new collaborator of type Driver
				var newDriver = new Collaborator
				{
					Name = vehicle.Driver.Name,
					Age = vehicle.Driver.Age,
					LicenseNumber = vehicle.Driver.LicenseNumber,
					CollaboratorType = CollaboratorType.Driver
				};

				_context.Collaborators.Add(newDriver);
				await _context.SaveChangesAsync();

				vehicle.DriverId = newDriver.Id;
			}
			else
			{
				// Ensure the existing collaborator is of type Driver
				if (existingCollaborator.CollaboratorType != CollaboratorType.Driver)
					return BadRequest("The associated collaborator must be a driver.");

				vehicle.DriverId = existingCollaborator.Id;
			}

			// Add the vehicle to the database
			_context.Vehicles.Add(vehicle);
			await _context.SaveChangesAsync();

			return Ok(vehicle);
		}

		/// <summary>
		/// Retrieves all vehicles along with their assigned drivers.
		/// </summary>
		/// <returns>A list of all vehicles.</returns>
		[HttpGet]
		public async Task<IActionResult> GetAllVehicles()
		{
			var vehicles = await _context.Vehicles
				.Include(v => v.Driver)
				.ToListAsync();
			return Ok(vehicles);
		}

		/// <summary>
		/// Retrieves a specific vehicle by its ID.
		/// </summary>
		/// <param name="id">The ID of the vehicle to retrieve.</param>
		/// <returns>The vehicle object or NotFound if not exists.</returns>
		[HttpGet("{id}")]
		public async Task<IActionResult> GetVehicleById(int id)
		{
			var vehicle = await _context.Vehicles
				.Include(v => v.Driver)
				.FirstOrDefaultAsync(v => v.Id == id);

			if (vehicle == null)
				return NotFound();

			return Ok(vehicle);
		}

		/// <summary>
		/// Deletes a vehicle by its ID.
		/// </summary>
		/// <param name="id">The ID of the vehicle to delete.</param>
		/// <returns>NoContent if deleted successfully, NotFound otherwise.</returns>
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteVehicle(int id)
		{
			var vehicle = await _context.Vehicles.FindAsync(id);
			if (vehicle == null)
				return NotFound();

			_context.Vehicles.Remove(vehicle);
			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}
