namespace WasteWatchAuth.Models
{
	public class ActivityLog
	{
		public int Id { get; set; }
		public DateTime Timestamp { get; set; }
		public string UserId { get; set; }
		public string Action { get; set; }  
		public string Metadata { get; set; }
	}

}
