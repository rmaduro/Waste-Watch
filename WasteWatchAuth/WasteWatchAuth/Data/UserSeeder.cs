using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace WasteWatchAuth.Data
{
	/// <summary>
	/// Class responsible for seeding initial users into the database.
	/// This includes an Admin, a Fleet Manager, and a Bin Manager.
	/// </summary>
	public class UserSeeder
	{
		/// <summary>
		/// Seeds default users if they do not already exist in the system.
		/// Assigns predefined roles to each user upon creation.
		/// </summary>
		/// <param name="userManager">The UserManager used to manage user creation and role assignment.</param>
		public static async Task SeedUsersAsync(UserManager<IdentityUser> userManager)
		{
			// 📌 Criar utilizador ADMIN
			string adminEmail = "admin@wastewatch.com";
			string adminPassword = "Admin@123";
			string adminRole = "Admin";

			var adminUser = await userManager.FindByEmailAsync(adminEmail);
			if (adminUser == null)
			{
				var newAdmin = new IdentityUser
				{
					UserName = adminEmail,
					Email = adminEmail,
					EmailConfirmed = true // Não exige confirmação de email
				};

				var createAdmin = await userManager.CreateAsync(newAdmin, adminPassword);
				if (createAdmin.Succeeded)
				{
					await userManager.AddToRoleAsync(newAdmin, adminRole);
				}
			}

			// 📌 Criar utilizador Fleet Manager
			string fleetEmail = "fleetmanager.wastewatch@gmail.com";
			string fleetPassword = "Fleet@123";
			string fleetRole = "Fleet Manager";

			var fleetUser = await userManager.FindByEmailAsync(fleetEmail);
			if (fleetUser == null)
			{
				var newFleetManager = new IdentityUser
				{
					UserName = fleetEmail,
					Email = fleetEmail,
					EmailConfirmed = true
				};

				var createFleet = await userManager.CreateAsync(newFleetManager, fleetPassword);
				if (createFleet.Succeeded)
				{
					await userManager.AddToRoleAsync(newFleetManager, fleetRole);
				}
			}

			// 📌 Criar utilizador Bin Manager
			string binEmail = "binmanager.wastewatch@gmail.com";
			string binPassword = "Bin@123";
			string binRole = "Bin Manager";

			var binUser = await userManager.FindByEmailAsync(binEmail);
			if (binUser == null)
			{
				var newBinManager = new IdentityUser
				{
					UserName = binEmail,
					Email = binEmail,
					EmailConfirmed = true
				};

				var createBin = await userManager.CreateAsync(newBinManager, binPassword);
				if (createBin.Succeeded)
				{
					await userManager.AddToRoleAsync(newBinManager, binRole);
				}
			}
		}
	}
}
