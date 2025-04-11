using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Controllers
{
	/// <summary>
	/// Controller responsible for managing the collection history of bins.
	/// </summary>
	[Route("api/collection-history")]
	[ApiController]
	public class CollectionHistoryController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		/// <summary>
		/// Constructor that injects the application database context.
		/// </summary>
		public CollectionHistoryController(ApplicationDbContext context)
		{
			_context = context;
		}

		/// <summary>
		/// Create a new manual collection record.
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateCollection([FromBody] CollectionHistory history)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			history.Timestamp = DateTime.UtcNow;

			_context.CollectionHistories.Add(history);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetCollectionHistoryById), new { id = history.Id }, history);
		}

		/// <summary>
		/// Retrieve all collection records.
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetAllCollections()
		{
			var collections = await _context.CollectionHistories.ToListAsync();
			return Ok(collections);
		}

		/// <summary>
		/// Retrieve all collection records for a specific bin.
		/// </summary>
		[HttpGet("bin/{id}")]
		public async Task<IActionResult> GetCollectionByBin(int id)
		{
			var collections = await _context.CollectionHistories
				.Where(c => c.BinId == id)
				.ToListAsync();

			if (!collections.Any())
				return NotFound(new { message = "No collection found for this bin." });

			return Ok(collections);
		}

		/// <summary>
		/// Retrieve the most recent collection for each bin.
		/// </summary>
		[HttpGet("latest")]
		public async Task<IActionResult> GetLatestCollectionForEachBin()
		{
			var latestCollections = await _context.CollectionHistories
				.GroupBy(c => c.BinId)
				.Select(g => g.OrderByDescending(c => c.Timestamp).FirstOrDefault())
				.ToListAsync();

			if (!latestCollections.Any() || latestCollections.All(c => c == null))
				return NotFound("No collection records found.");

			return Ok(latestCollections);
		}

		/// <summary>
		/// Retrieve a specific collection history by ID.
		/// </summary>
		[HttpGet("by-id/{id}")]
		public async Task<IActionResult> GetCollectionHistoryById(int id)
		{
			var history = await _context.CollectionHistories
				.FirstOrDefaultAsync(ch => ch.Id == id);

			if (history == null)
				return NotFound(new { message = "Collection history not found." });

			return Ok(history);
		}

		/// <summary>
		/// Retrieve the most recent collection for a specific bin.
		/// </summary>
		[HttpGet("latest/{binId}")]
		public async Task<IActionResult> GetLatestCollectionForBin(int binId)
		{
			var latestCollection = await _context.CollectionHistories
				.Where(c => c.BinId == binId)
				.OrderByDescending(c => c.Timestamp)
				.FirstOrDefaultAsync();

			if (latestCollection == null)
				return NotFound($"No collection found for bin with ID {binId}.");

			return Ok(latestCollection);
		}

		/// <summary>
		/// Get the total number of collection records.
		/// </summary>
		[HttpGet("total")]
		public async Task<IActionResult> GetTotalCollections()
		{
			var totalCollections = await _context.CollectionHistories.CountAsync();
			return Ok(new { totalCollections });
		}

		/// <summary>
		/// Get the total number of collections for a specific day.
		/// </summary>
		/// <param name="date">Optional date to filter collections (UTC). Defaults to today.</param>
		[HttpGet("daily-collections")]
		public async Task<IActionResult> GetDailyCollections([FromQuery] DateTime? date)
		{
			try
			{
				var targetDate = date ?? DateTime.UtcNow.Date;
				var totalCollections = await _context.CollectionHistories
					.Where(ch => ch.Timestamp.Date == targetDate)
					.CountAsync();

				return Ok(new
				{
					date = targetDate,
					totalCollections = totalCollections
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new
				{
					message = "Unable to fetch daily collection data. Please try again later.",
					error = ex.Message
				});
			}
		}

		/// <summary>
		/// Calculate the average consumption over a specific time period.
		/// </summary>
		/// <param name="startDate">Start date of the custom range.</param>
		/// <param name="endDate">End date of the custom range.</param>
		/// <param name="period">Optional predefined period: "daily", "weekly", or "monthly".</param>
		[HttpGet("average-consumption")]
		public async Task<IActionResult> GetAverageConsumption(
			[FromQuery] DateTime? startDate,
			[FromQuery] DateTime? endDate,
			[FromQuery] string? period)
		{
			DateTime fromDate;
			DateTime toDate = DateTime.UtcNow;

			switch (period?.ToLower())
			{
				case "daily":
					fromDate = DateTime.UtcNow.Date;
					break;
				case "weekly":
					fromDate = DateTime.UtcNow.AddDays(-7);
					break;
				case "monthly":
					fromDate = DateTime.UtcNow.AddMonths(-1);
					break;
				default:
					if (!startDate.HasValue || !endDate.HasValue)
						return BadRequest(
							"A period ('daily', 'weekly', 'monthly') or a valid date range (startDate and endDate) must be provided.");

					fromDate = startDate.Value;
					toDate = endDate.Value;
					break;
			}

			if (fromDate > toDate)
				return BadRequest("Start date cannot be after end date.");

			var collections = await _context.CollectionHistories
				.Where(ch => ch.Timestamp >= fromDate && ch.Timestamp <= toDate)
				.ToListAsync();

			if (!collections.Any())
				return NotFound(new { message = "Insufficient data to calculate average consumption." });

			double averageConsumption = collections.Average(ch => ch.AmountCollected);

			return Ok(new
			{
				averageConsumption,
				startDate = fromDate,
				endDate = toDate
			});
		}
	}
}
