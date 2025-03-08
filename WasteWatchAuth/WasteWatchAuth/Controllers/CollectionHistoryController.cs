using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Controllers
{
	[Route("api/collection-history")]
	[ApiController]
	public class CollectionHistoryController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public CollectionHistoryController(ApplicationDbContext context)
		{
			_context = context;
		}
		
		
		/// <summary>
		/// Criar um novo registo de recolha manualmente.
		/// </summary>
		[HttpPost]
		public async Task<IActionResult> CreateCollection([FromBody] CollectionHistory history)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			// Define o timestamp como o momento atual
			history.Timestamp = DateTime.UtcNow;

			_context.CollectionHistories.Add(history);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetCollectionHistoryById), new { id = history.Id }, history);
		}


		/// <summary>
		/// Obter todas as recolhas registadas.
		/// </summary>
		[HttpGet]
		public async Task<IActionResult> GetAllCollections()
		{
			var collections = await _context.CollectionHistories.ToListAsync();
			return Ok(collections);
		}

		/// <summary>
		/// Obter todas as recolhas de um bin específico.
		/// </summary>
		[HttpGet("bin/{id}")]
		public async Task<IActionResult> GetCollectionByBin(int id)
		{
			var collections = await _context.CollectionHistories
				.Where(c => c.BinId == id)
				.ToListAsync();

			if (!collections.Any())
				return NotFound(new { message = "Nenhuma recolha encontrada para este bin." });

			return Ok(collections);
		}

		/// <summary>
		/// Obter a última recolha de cada bin.
		/// </summary>
		[HttpGet("latest")]
		public async Task<IActionResult> GetLatestCollectionForEachBin()
		{
			var latestCollections = await _context.CollectionHistories
				.GroupBy(c => c.BinId)
				.Select(g => g.OrderByDescending(c => c.Timestamp).FirstOrDefault())
				.ToListAsync();

			if (!latestCollections.Any() || latestCollections.All(c => c == null))
				return NotFound("Nenhuma recolha encontrada.");

			return Ok(latestCollections);
		}


		/// <summary>
		/// Obtém um histórico de recolha por ID.
		/// </summary>
		[HttpGet("by-id/{id}")]
		public async Task<IActionResult> GetCollectionHistoryById(int id)
		{
			var history = await _context.CollectionHistories
				.FirstOrDefaultAsync(ch => ch.Id == id);

			if (history == null)
				return NotFound(new { message = "Histórico de recolha não encontrado." });

			return Ok(history);
		}

		/// <summary>
		/// Obter a última recolha de um bin específico.
		/// </summary>
		[HttpGet("latest/{binId}")]
		public async Task<IActionResult> GetLatestCollectionForBin(int binId)
		{
			var latestCollection = await _context.CollectionHistories
				.Where(c => c.BinId == binId)
				.OrderByDescending(c => c.Timestamp)
				.FirstOrDefaultAsync();

			if (latestCollection == null)
				return NotFound($"Nenhuma recolha encontrada para o bin com ID {binId}.");

			return Ok(latestCollection);
		}

	}
}
