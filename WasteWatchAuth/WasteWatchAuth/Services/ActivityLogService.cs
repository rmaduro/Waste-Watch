using System.Security.Claims;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;

namespace WasteWatchAuth.Services
{
	/// <summary>
	/// Service responsible for logging user activities in the system.
	/// </summary>
	public class ActivityLogService
	{
		private readonly ApplicationDbContext _context;
		private readonly IHttpContextAccessor _httpContextAccessor;

		/// <summary>
		/// Constructor for ActivityLogService.
		/// </summary>
		/// <param name="context">Database context used to persist activity logs.</param>
		/// <param name="httpContextAccessor">Provides access to the current HTTP context.</param>
		public ActivityLogService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
		{
			_context = context;
			_httpContextAccessor = httpContextAccessor;
		}

		/// <summary>
		/// Logs a user activity to the database.
		/// </summary>
		/// <param name="action">The name of the action being logged (e.g., "Login", "CreateBin").</param>
		/// <param name="metadata">Optional metadata with additional details about the activity.</param>
		public async Task LogActivityAsync(string action, string metadata = null)
		{
			var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

			var log = new ActivityLog
			{
				Timestamp = DateTime.UtcNow,
				UserId = userId,
				Action = action,
				Metadata = metadata
			};

			_context.ActivityLogs.Add(log);
			await _context.SaveChangesAsync();
		}
	}
}