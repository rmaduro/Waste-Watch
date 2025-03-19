
	using global::WasteWatchAuth.Data;
	using Humanizer;
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
		public class BinsController : ControllerBase
		{
			private readonly ApplicationDbContext _context;

			public BinsController(ApplicationDbContext context)
			{
				_context = context;
			}

		/// <summary>
		/// Criar um novo bin
		/// </summary>
			[HttpPost]
			public async Task<IActionResult> CreateBin([FromBody] Bin bin)
			{
				if (bin == null || bin.Location == null)
					return BadRequest("Invalid bin or location data.");

				bin.CurrentFillLevel = 0; // Definir nível inicial como 0

				_context.Bins.Add(bin);
				await _context.SaveChangesAsync();

				return Ok(bin);
			}


		/// <summary>
		/// Obter todos os bins
		/// </summary>
		[HttpGet]
			public IActionResult GetAllBins()
			{
				return Ok(_context.Bins.Include(b => b.Location).ToList());
			}

			/// <summary>
			/// Obter um bin por ID
			/// </summary>
			[HttpGet("{id}")]
			public async Task<IActionResult> GetBinById(int id)
			{
				var bin = await _context.Bins.Include(b => b.Location).FirstOrDefaultAsync(b => b.Id == id);
				if (bin == null)
					return NotFound();

				return Ok(bin);
			}

			/// <summary>
			/// Remover um bin
			/// </summary>
			[HttpDelete("{id}")]
			public async Task<IActionResult> DeleteBin(int id)
			{
				var bin = await _context.Bins.FindAsync(id);
				if (bin == null)
					return NotFound();

				_context.Bins.Remove(bin);
				await _context.SaveChangesAsync();

				return NoContent();
			}


			[HttpPost("{id}/maintenance/start")]
			public async Task<IActionResult> StartMaintenance(int id, [FromBody] MaintenanceRequest model)
			{
				var bin = await _context.Bins.FindAsync(id);
				if (bin == null)
					return NotFound(new { message = "Bin não encontrado." });

				// Atualizar status para manutenção
				bin.Status = BinStatus.Maintenance;
				_context.Bins.Update(bin);

				// Criar um novo registro de manutenção
				var maintenanceLog = new MaintenanceHistory
				{
					BinId = bin.Id,
					UserId = model.UserId,
					MaintenanceType = model.MaintenanceType,
					Description = model.Description,
					StartDate = DateTime.UtcNow,  // Definir a data de início
					EndDate = null // Ainda não saiu da manutenção
				};

				_context.MaintenanceHistories.Add(maintenanceLog);
				await _context.SaveChangesAsync();

				return Ok(new { message = "Bin colocado em manutenção e histórico registrado." });
			}



			[HttpPost("{id}/maintenance/end")]
			public async Task<IActionResult> EndMaintenance(int id, [FromBody] EndMaintenanceRequest model)
			{
				var bin = await _context.Bins.FindAsync(id);
				if (bin == null)
					return NotFound(new { message = "Bin não encontrado." });

				// Encontrar a última manutenção ativa do contentor
				var maintenanceLog = await _context.MaintenanceHistories
					.Where(m => m.BinId == id && m.EndDate == null)
					.OrderByDescending(m => m.StartDate)
					.FirstOrDefaultAsync();

				if (maintenanceLog == null)
					return BadRequest(new { message = "Não há manutenção ativa para este bin." });

				// Atualizar o status do bin para ativo
				bin.Status = BinStatus.Active;
				_context.Bins.Update(bin);

				// Definir a data de término da manutenção
				maintenanceLog.EndDate = DateTime.UtcNow;
				_context.MaintenanceHistories.Update(maintenanceLog);

				await _context.SaveChangesAsync();

				return Ok(new { message = "Manutenção concluída e histórico atualizado." });
			}

		/// <summary>
		/// Obtém o histórico completo de manutenção de bins.
		/// </summary>
		[HttpGet("maintenance-history")]
		public async Task<IActionResult> GetMaintenanceHistory()
		{
			var maintenanceRecords = await _context.MaintenanceHistories
				.Include(m => m.Bin) // Inclui os detalhes do bin associado
			
				.ToListAsync();

			return Ok(maintenanceRecords);
		}

		/// <summary>
		/// Obtém todos os bins que estão atualmente em manutenção.
		/// </summary>
		[HttpGet("maintenance-history/active")]
		public async Task<IActionResult> GetBinsInMaintenance()
		{
			var activeMaintenanceRecords = await _context.MaintenanceHistories
				.Where(m => m.EndDate == null) // Apenas manutenções em curso
				.Include(m => m.Bin)
				.ToListAsync();

			return Ok(activeMaintenanceRecords);
		}

		/// <summary>
		/// Obtém o histórico de manutenção dentro de um intervalo de datas.
		/// </summary>
		[HttpGet("maintenance-history/filter")]
		public async Task<IActionResult> GetMaintenanceHistoryByDateRange([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
		{
			var query = _context.MaintenanceHistories.AsQueryable();

			if (startDate.HasValue)
				query = query.Where(m => m.StartDate >= startDate.Value);

			if (endDate.HasValue)
				query = query.Where(m => m.StartDate <= endDate.Value); 

			var filteredRecords = await query
				.Include(m => m.Bin)
				.ToListAsync();

			return Ok(filteredRecords);
		}



		[HttpPut("{id}/fill-level")]
		public async Task<IActionResult> UpdateFillLevel(int id, [FromBody] Dictionary<string, double> data)
		{
			if (!data.ContainsKey("amount"))
				return BadRequest("O campo 'amount' é obrigatório.");

			double amount = data["amount"];

			var bin = await _context.Bins.FindAsync(id);
			if (bin == null)
				return NotFound("Bin não encontrado.");

			if (amount < 0 || amount > bin.Capacity)
				return BadRequest("O valor de enchimento deve estar entre 0 e a capacidade máxima do bin.");

			bin.CurrentFillLevel = amount;
			_context.Bins.Update(bin);
			await _context.SaveChangesAsync();

			return Ok(new { message = "Nível de enchimento atualizado com sucesso." });
		}



		[HttpPost("{id}/empty")]
		public async Task<IActionResult> EmptyBin(int id)
		{
			var bin = await _context.Bins.FindAsync(id);
			if (bin == null)
				return NotFound("Bin não encontrado.");

			bin.CurrentFillLevel = 0;
			bin.LastEmptied = DateTime.UtcNow;

			_context.Bins.Update(bin);
			await _context.SaveChangesAsync();

			return Ok(new { message = "Bin esvaziado com sucesso." });
		}

		[HttpGet("almost-full")]
		public async Task<IActionResult> GetAlmostFullBins()
		{
			var almostFullBins = await _context.Bins
				.Where(b => (b.CurrentFillLevel / b.Capacity) >= 0.65)
				.ToListAsync();

			if (almostFullBins.Count == 0)
				return Ok(new { message = "No bins nearing full capacity." });

			return Ok(almostFullBins);
		}

	}
}


