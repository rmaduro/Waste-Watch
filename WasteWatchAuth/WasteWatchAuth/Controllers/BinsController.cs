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
	/// <summary>
	/// Controller responsible for managing bins and their maintenance history.
	/// </summary>
	[Route("api/[controller]")]
	[ApiController]
	public class BinsController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		/// <summary>
		/// Constructor that injects the application database context.
		/// </summary>
		public BinsController(ApplicationDbContext context)
		{
			_context = context;
		}

		/// <summary>
		/// Create a new bin with location.
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateBin([FromBody] Bin bin)
		{
			if (bin == null || bin.Location == null)
				return BadRequest("Invalid bin or location data.");

			bin.CurrentFillLevel = 0;

			_context.Bins.Add(bin);
			await _context.SaveChangesAsync();

			return Ok(bin);
		}

		/// <summary>
		/// Retrieve all bins.
		/// </summary>
		[HttpGet]
		public IActionResult GetAllBins()
		{
			return Ok(_context.Bins.Include(b => b.Location).ToList());
		}

		/// <summary>
		/// Retrieve a bin by its ID.
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
		/// Delete a bin by its ID.
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

		/// <summary>
		/// Start maintenance for a specific bin.
		/// </summary>
		[HttpPost("{id}/maintenance/start")]
		public async Task<IActionResult> StartMaintenance(int id, [FromBody] MaintenanceRequest model)
		{
			var bin = await _context.Bins.FindAsync(id);
			if (bin == null)
				return NotFound(new { message = "Bin not found." });

			bin.Status = BinStatus.Maintenance;
			_context.Bins.Update(bin);

			var maintenanceLog = new MaintenanceHistory
			{
				BinId = bin.Id,
				UserId = model.UserId,
				MaintenanceType = model.MaintenanceType,
				Description = model.Description,
				StartDate = DateTime.UtcNow,
				EndDate = null
			};

			_context.MaintenanceHistories.Add(maintenanceLog);
			await _context.SaveChangesAsync();

			return Ok(new { message = "Bin marked as under maintenance and history recorded." });
		}

		/// <summary>
		/// End maintenance for a specific bin.
		/// </summary>
		[HttpPost("{id}/maintenance/end")]
		public async Task<IActionResult> EndMaintenance(int id, [FromBody] EndMaintenanceRequest model)
		{
			var bin = await _context.Bins.FindAsync(id);
			if (bin == null)
				return NotFound(new { message = "Bin not found." });

			var maintenanceLog = await _context.MaintenanceHistories
				.Where(m => m.BinId == id && m.EndDate == null)
				.OrderByDescending(m => m.StartDate)
				.FirstOrDefaultAsync();

			if (maintenanceLog == null)
				return BadRequest(new { message = "No active maintenance found for this bin." });

			bin.Status = BinStatus.Active;
			_context.Bins.Update(bin);

			maintenanceLog.EndDate = DateTime.UtcNow;
			_context.MaintenanceHistories.Update(maintenanceLog);

			await _context.SaveChangesAsync();

			return Ok(new { message = "Maintenance ended and history updated." });
		}

		/// <summary>
		/// Retrieve the full maintenance history of all bins.
		/// </summary>
		[HttpGet("maintenance-history")]
		public async Task<IActionResult> GetMaintenanceHistory()
		{
			var maintenanceRecords = await _context.MaintenanceHistories
				.Include(m => m.Bin)
				.ToListAsync();

			return Ok(maintenanceRecords);
		}

		/// <summary>
		/// Retrieve all bins currently under maintenance.
		/// </summary>
		[HttpGet("maintenance-history/active")]
		public async Task<IActionResult> GetBinsInMaintenance()
		{
			var activeMaintenanceRecords = await _context.MaintenanceHistories
				.Where(m => m.EndDate == null)
				.Include(m => m.Bin)
				.ToListAsync();

			return Ok(activeMaintenanceRecords);
		}

		/// <summary>
		/// Retrieve maintenance history records within a specified date range.
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

		/// <summary>
		/// Update the current fill level of a bin.
		/// </summary>
		[HttpPut("{id}/fill-level")]
		public async Task<IActionResult> UpdateFillLevel(int id, [FromBody] Dictionary<string, double> data)
		{
			if (!data.ContainsKey("amount"))
				return BadRequest("The 'amount' field is required.");

			double amount = data["amount"];

			var bin = await _context.Bins.FindAsync(id);
			if (bin == null)
				return NotFound("Bin not found.");

			if (amount < 0 || amount > bin.Capacity)
				return BadRequest("Fill level must be between 0 and the bin's maximum capacity.");

			bin.CurrentFillLevel = amount;
			_context.Bins.Update(bin);
			await _context.SaveChangesAsync();

			return Ok(new { message = "Fill level successfully updated." });
		}

		/// <summary>
		/// Empty a bin (set fill level to 0).
		/// </summary>
		[HttpPost("{id}/empty")]
		public async Task<IActionResult> EmptyBin(int id)
		{
			var bin = await _context.Bins.FindAsync(id);
			if (bin == null)
				return NotFound("Bin not found.");

			bin.CurrentFillLevel = 0;
			bin.LastEmptied = DateTime.UtcNow;

			_context.Bins.Update(bin);
			await _context.SaveChangesAsync();

			return Ok(new { message = "Bin successfully emptied." });
		}

		/// <summary>
		/// Retrieve all bins that are at least 65% full.
		/// </summary>
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

		/// <summary>
		/// Retrieve all bins marked as NotFunctional (damaged).
		/// </summary>
		[HttpGet("damagedbins")]
		public async Task<IActionResult> GetDamagedBins()
		{
			var damagedBins = await _context.Bins
				.Where(b => b.Status == BinStatus.NotFunctional)
				.Include(b => b.Location)
				.ToListAsync();

			if (damagedBins.Count == 0)
				return Ok(new { message = "No damaged bins found." });

			return Ok(damagedBins);
		}
	}
}
