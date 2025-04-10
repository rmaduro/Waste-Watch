using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Data;

namespace WasteWatchAuth.Controllers
{
	/// <summary>
	/// Controller responsible for displaying application activity logs.
	/// Only accessible by users with the "Admin" role.
	/// </summary>
	[Authorize(Roles = "Admin")] // Only Admins can access logs
	public class LogsController : Controller
	{
		private readonly ApplicationDbContext _context;

		/// <summary>
		/// Constructor that injects the application database context.
		/// </summary>
		/// <param name="context">Database context used to access logs.</param>
		public LogsController(ApplicationDbContext context)
		{
			_context = context;
		}

		/// <summary>
		/// Retrieves and displays the list of activity logs.
		/// </summary>
		/// <returns>A view containing all activity logs.</returns>
		public async Task<IActionResult> Index()
		{
			var logs = await _context.ActivityLogs.ToListAsync();
			return View(logs);
		}
	}
}