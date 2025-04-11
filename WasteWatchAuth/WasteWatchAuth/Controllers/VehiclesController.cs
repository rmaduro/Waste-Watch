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

            // Se um RouteId foi fornecido, associamos a rota ao veículo
            if (vehicle.RouteId != null)
            {
                var existingRoute = await _context.Routes
                    .FirstOrDefaultAsync(r => r.Id == vehicle.RouteId);

                if (existingRoute != null)
                {
                    vehicle.Route = existingRoute; // Atribui a rota ao veículo
                }
                else
                {
                    return BadRequest("Rota não encontrada.");
                }
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
        /// Atualizar um veículo
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] Vehicle updatedVehicle)
        {
            if (updatedVehicle == null)
                return BadRequest("Dados do veículo inválidos.");

            var existingVehicle = await _context.Vehicles
                .Include(v => v.Driver)
                .Include(v => v.Route) // Certifica-se de que a rota também é carregada
                .FirstOrDefaultAsync(v => v.Id == id);

            if (existingVehicle == null)
                return NotFound();

            // Atualiza o veículo com os novos dados
            existingVehicle.LicensePlate = updatedVehicle.LicensePlate;
            existingVehicle.Status = updatedVehicle.Status;
            existingVehicle.RouteType = updatedVehicle.RouteType;
            existingVehicle.MaxCapacity = updatedVehicle.MaxCapacity;
            existingVehicle.LastMaintenance = updatedVehicle.LastMaintenance;
            existingVehicle.Latitude = updatedVehicle.Latitude;
            existingVehicle.Longitude = updatedVehicle.Longitude;

            // Atualiza o motorista, se fornecido
            if (updatedVehicle.Driver != null)
            {
                var driver = await _context.Collaborators
                    .FirstOrDefaultAsync(d => d.Id == updatedVehicle.Driver.Id);

                if (driver != null)
                {
                    existingVehicle.DriverId = driver.Id;
                    existingVehicle.Driver = driver;
                }
                else
                {
                    // Se o motorista não existe, criar um novo motorista
                    var newDriver = new Collaborator
                    {
                        Name = updatedVehicle.Driver.Name,
                        Age = updatedVehicle.Driver.Age,
                        LicenseNumber = updatedVehicle.Driver.LicenseNumber,
                        CollaboratorType = CollaboratorType.Driver
                    };

                    _context.Collaborators.Add(newDriver);
                    await _context.SaveChangesAsync();

                    existingVehicle.DriverId = newDriver.Id;
                    existingVehicle.Driver = newDriver;
                }
            }

            // Se necessário, atualize outras propriedades, como a rota
            if (updatedVehicle.RouteId != null)
            {
                var existingRoute = await _context.Routes
                    .FirstOrDefaultAsync(r => r.Id == updatedVehicle.RouteId);

                if (existingRoute != null)
                {
                    existingVehicle.RouteId = updatedVehicle.RouteId;
                    existingVehicle.Route = existingRoute; // Atribui a rota ao veículo
                }
                else
                {
                    return BadRequest("Rota não encontrada.");
                }
            }

            // Salve as mudanças no banco de dados
            _context.Vehicles.Update(existingVehicle);
            await _context.SaveChangesAsync();

            return Ok(existingVehicle);
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
