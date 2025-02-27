using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Data;

namespace WasteWatchAuth.Controllers
{
	[Authorize(Roles = "Admin")] // Apenas Admin pode ver os logs
	public class LogsController : Controller
	{
		private readonly ApplicationDbContext _context;

		public LogsController(ApplicationDbContext context)
		{
			_context = context;
		}

		public async Task<IActionResult> Index()
		{
			var logs = await _context.ActivityLogs.ToListAsync();
			return View(logs);
		}
	}
}
