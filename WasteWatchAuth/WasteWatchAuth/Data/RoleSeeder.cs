using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace WasteWatchAuth.Data
{
	public static class RoleSeeder
	{
		public static async Task SeedRoles(RoleManager<IdentityRole> roleManager)
		{
			string[] roleNames = { "Admin", "Fleet Manager", "Bin Manager" };

			foreach (var roleName in roleNames)
			{
				if (!await roleManager.RoleExistsAsync(roleName))
				{
					await roleManager.CreateAsync(new IdentityRole(roleName));
				}
			}
		}
	}
}