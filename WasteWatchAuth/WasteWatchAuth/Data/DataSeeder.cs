using Microsoft.AspNetCore.Identity;

namespace WasteWatchAuth.Data
{
	public static class DataSeeder
	{
		public static async Task SeedDatabase(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
		{
			string[] roles = { "Admin", "Fleet Manager", "Bin Manager" };

			// Criar roles se não existirem
			foreach (var role in roles)
			{
				if (!await roleManager.RoleExistsAsync(role))
				{
					await roleManager.CreateAsync(new IdentityRole(role));
				}
			}

			// Criar utilizador Admin se não existir
			var adminEmail = "admin@wastewatch.com";
			var adminUser = await userManager.FindByEmailAsync(adminEmail);
			if (adminUser == null)
			{
				var newAdmin = new IdentityUser
				{
					UserName = adminEmail,
					Email = adminEmail,
					EmailConfirmed = true
				};

				var result = await userManager.CreateAsync(newAdmin, "Admin@123");
				if (result.Succeeded)
				{
					await userManager.AddToRoleAsync(newAdmin, "Admin");
				}
			}
		}
	}
}
