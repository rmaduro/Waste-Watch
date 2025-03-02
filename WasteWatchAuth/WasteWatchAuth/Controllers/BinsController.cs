
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
		}
	}

