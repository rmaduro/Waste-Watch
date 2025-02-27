using System.Security.Claims;
using WasteWatchAuth.Data;
using WasteWatchAuth.Models;


namespace WasteWatchAuth.Services
{
	public class ActivityLogService
	{
		private readonly ApplicationDbContext _context;
		private readonly IHttpContextAccessor _httpContextAccessor;

		public ActivityLogService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
		{
			_context = context;
			_httpContextAccessor = httpContextAccessor;
		}

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
