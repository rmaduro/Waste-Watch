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

		/// <summary>
		/// Retrieves all bin-related notifications ordered by creation date (most recent first).
		/// </summary>
		/// <returns>A list of bin notifications.</returns>
		[HttpGet("bin")]
		public async Task<IActionResult> GetBinNotifications()
		{
			var notifications = await _context.Notifications
				.Where(n => n.Type == "Bin")
				.OrderByDescending(n => n.CreatedAt)
				.ToListAsync();

			return Ok(notifications);
		}

		/// <summary>
		/// Retrieves all fleet-related notifications ordered by creation date (most recent first).
		/// </summary>
		/// <returns>A list of fleet notifications.</returns>
		[HttpGet("fleet")]
		public async Task<IActionResult> GetFleetNotifications()
		{
			var notifications = await _context.Notifications
				.Where(n => n.Type == "Fleet")
				.OrderByDescending(n => n.CreatedAt)
				.ToListAsync();

			return Ok(notifications);
		}

		/// <summary>
		/// Creates a new notification.
		/// </summary>
		/// <param name="notification">The notification object to be created.</param>
		/// <returns>The created notification.</returns>
		[HttpPost]
		public async Task<IActionResult> CreateNotification([FromBody] Notification notification)
		{
			_context.Notifications.Add(notification);
			await _context.SaveChangesAsync();
			return Ok(notification);
		}
	}
}