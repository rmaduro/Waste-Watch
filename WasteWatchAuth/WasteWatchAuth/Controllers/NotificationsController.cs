using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class NotificationsController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public NotificationsController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpGet("bin")]
		public async Task<IActionResult> GetBinNotifications()
		{
			var notifications = await _context.Notifications
				.Where(n => n.Type == "Bin")
				.OrderByDescending(n => n.CreatedAt)
				.ToListAsync();

			return Ok(notifications);
		}

		[HttpGet("fleet")]
		public async Task<IActionResult> GetFleetNotifications()
		{
			var notifications = await _context.Notifications
				.Where(n => n.Type == "Fleet")
				.OrderByDescending(n => n.CreatedAt)
				.ToListAsync();

			return Ok(notifications);
		}

		[HttpPost]
		public async Task<IActionResult> CreateNotification([FromBody] Notification notification)
		{
			_context.Notifications.Add(notification);
			await _context.SaveChangesAsync();
			return Ok(notification);
		}
	}

}
