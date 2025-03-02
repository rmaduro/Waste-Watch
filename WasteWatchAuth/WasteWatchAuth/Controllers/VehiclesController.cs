using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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
		/// Cria um novo veículo e associa um condutor.
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateVehicle([FromBody] Vehicle vehicle)
		{
			if (vehicle == null || vehicle.Driver == null)
				return BadRequest("Invalid vehicle or driver data.");

			// Verifica se já existe um veículo com a mesma matrícula
			bool exists = await _context.Vehicles.AnyAsync(v => v.LicensePlate == vehicle.LicensePlate);
			if (exists)
				return Conflict(new { message = "Já existe um veículo com esta matrícula." });

			// Adiciona o condutor primeiro (se não existir)
			var existingDriver = await _context.Drivers.FirstOrDefaultAsync(d => d.Name == vehicle.Driver.Name);
			if (existingDriver != null)
			{
				vehicle.DriverId = existingDriver.Id;
				vehicle.Driver = existingDriver;
			}
			else
			{
				_context.Drivers.Add(vehicle.Driver);
				await _context.SaveChangesAsync();
				vehicle.DriverId = vehicle.Driver.Id;
			}

			// Adiciona o veículo
			_context.Vehicles.Add(vehicle);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetVehicleById), new { id = vehicle.Id }, vehicle);
		}

		/// <summary>
		/// Obtém um veículo pelo ID, incluindo o condutor.
		/// </summary>
		[HttpGet("{id}")]
		public async Task<IActionResult> GetVehicleById(int id)
		{
			var vehicle = await _context.Vehicles
				.Include(v => v.Driver) // Incluir o condutor nos resultados
				.FirstOrDefaultAsync(v => v.Id == id);

			if (vehicle == null)
				return NotFound();

			return Ok(vehicle);
		}

		/// <summary>
		/// Obtém todos os veículos, incluindo condutores.
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetAllVehicles()
		{
			var vehicles = await _context.Vehicles.Include(v => v.Driver).ToListAsync();
			return Ok(vehicles);
		}

		/// <summary>
		/// Remove um veículo pelo ID.
		/// </summary>
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
