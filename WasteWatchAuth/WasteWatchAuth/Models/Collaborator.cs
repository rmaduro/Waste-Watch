using System.ComponentModel.DataAnnotations;

namespace WasteWatchAuth.Models
{
	public class Collaborator
	{
		public int Id { get; set; }

		[Required] public string Name { get; set; }

		[Required] public int Age { get; set; }

		[Required] public string LicenseNumber { get; set; }

		[Required] public CollaboratorType CollaboratorType { get; set; }
	}
}