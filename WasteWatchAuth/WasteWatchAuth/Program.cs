using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Data;

var builder = WebApplication.CreateBuilder(args);

// Adicionar a base de dados e o contexto
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// Configurar Identity
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = true;
})
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders()
    .AddDefaultUI();

// Configuração para cookies (sessão e autenticação)
builder.Services.ConfigureApplicationCookie(options =>
{
    options.ExpireTimeSpan = TimeSpan.FromMinutes(10); // Tempo de inatividade antes do logout
    options.SlidingExpiration = true;
    options.LoginPath = "/Identity/Account/Login";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
});

// Registrar o serviço de envio de emails
builder.Services.AddTransient<IEmailSender, EmailSender>();

// Adicionar controladores e vistas
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configurar o pipeline de requisições
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
    await RoleSeeder.SeedRoles(roleManager);
}
using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	var userManager = services.GetRequiredService<UserManager<IdentityUser>>();

	string adminEmail = "wastewatchproject@gmail.com"; // Confirma que é o teu email
	string adminRole = "Admin";

	var adminUser = await userManager.FindByEmailAsync(adminEmail);
	if (adminUser != null)
	{
		// Verifica se o utilizador já tem o role
		if (!await userManager.IsInRoleAsync(adminUser, adminRole))
		{
			await userManager.AddToRoleAsync(adminUser, adminRole);
			Console.WriteLine($"Role '{adminRole}' atribuído ao utilizador {adminEmail}");
		}
	}
}


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();
