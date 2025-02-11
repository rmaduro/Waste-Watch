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
	options.SignIn.RequireConfirmedAccount = false; // Removida a confirmação de email no login
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

// Registrar o serviço de envio de emails (para recuperação de password)
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

// Criar a base de dados e popular os seeders (Roles e Users)
using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
	var userManager = services.GetRequiredService<UserManager<IdentityUser>>();
	var context = services.GetRequiredService<ApplicationDbContext>();

	await context.Database.MigrateAsync(); // Garantir que a base de dados está criada e atualizada

	// Chamar os seeders
	await RoleSeeder.SeedRoles(roleManager);
	await UserSeeder.SeedUsersAsync(userManager);
}

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();
