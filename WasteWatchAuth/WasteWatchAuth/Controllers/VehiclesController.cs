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
		/// Criar um veículo e o seu motorista (Driver)
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateVehicle([FromBody] Vehicle vehicle)
		{
			if (vehicle == null || vehicle.Driver == null)
				return BadRequest("Dados do veículo ou do motorista inválidos.");

			// Verifica se já existe um veículo com a mesma matrícula
			bool exists = await _context.Vehicles.AnyAsync(v => v.LicensePlate == vehicle.LicensePlate);
			if (exists)
				return Conflict(new { message = "Já existe um veículo com esta matrícula." });

			// Verifica se o colaborador já existe na base de dados
			var existingCollaborator = await _context.Collaborators
				.FirstOrDefaultAsync(c => c.LicenseNumber == vehicle.Driver.LicenseNumber);

			if (existingCollaborator == null)
			{
				// Criar novo colaborador do tipo Driver
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
				// Se o colaborador já existir, garantir que é um Driver
				if (existingCollaborator.CollaboratorType != CollaboratorType.Driver)
					return BadRequest("O colaborador associado deve ser um motorista (Driver).");

				vehicle.DriverId = existingCollaborator.Id;
			}

			// Adicionar veículo à base de dados
			_context.Vehicles.Add(vehicle);
			await _context.SaveChangesAsync();

			return Ok(vehicle);
		}

		/// <summary>
		/// Obter todos os veículos
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetAllVehicles()
		{
			var vehicles = await _context.Vehicles
				.Include(v => v.Driver)
				.ToListAsync();
			return Ok(vehicles);
		}

		/// <summary>
		/// Obter um veículo por ID
		/// </summary>
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
		/// Remover um veículo
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
