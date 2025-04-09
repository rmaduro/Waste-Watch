using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace WasteWatchAuth.Data
{
	/// <summary>
	/// Static class responsible for seeding default user roles into the database.
	/// </summary>
	public static class RoleSeeder
	{
		/// <summary>
		/// Seeds predefined roles into the application's identity system.
		/// If a role does not exist, it will be created.
		/// </summary>
		/// <param name="roleManager">The RoleManager instance used to manage roles.</param>
		public static async Task SeedRoles(RoleManager<IdentityRole> roleManager)
		{
			string[] roleNames = { "Admin", "Fleet Manager", "Bin Manager" };

			foreach (var roleName in roleNames)
			{
				// Check if the role already exists; if not, create it
				if (!await roleManager.RoleExistsAsync(roleName))
				{
					await roleManager.CreateAsync(new IdentityRole(roleName));
				}
			}
		}
	}
}