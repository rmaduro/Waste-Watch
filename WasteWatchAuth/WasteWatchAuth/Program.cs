using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using WasteWatchAuth.Data;
using WasteWatchAuth.Services;

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
	options.SignIn.RequireConfirmedAccount = false; // Permitir login sem confirmar e-mail
})
	.AddRoles<IdentityRole>()
	.AddEntityFrameworkStores<ApplicationDbContext>()
	.AddDefaultTokenProviders()
	.AddDefaultUI();

builder.Services.AddScoped<ActivityLogService>();

// Configuração para cookies (sessão e autenticação)
builder.Services.ConfigureApplicationCookie(options =>
{
	options.ExpireTimeSpan = TimeSpan.FromMinutes(10); // Logout automático após 10 min de inatividade
	options.SlidingExpiration = true;
	options.LoginPath = "/Identity/Account/Login";
	options.AccessDeniedPath = "/Identity/Account/AccessDenied";
});

// Habilitar CORS para permitir conexões do frontend específico
builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend",
		policy => policy.WithOrigins("http://localhost:3000") // Trocar pelo URL do frontend
			.AllowAnyMethod()
			.AllowAnyHeader());
});

// Registrar o serviço de envio de emails (para recuperação de password)
builder.Services.AddTransient<IEmailSender, EmailSender>();

// Adicionar suporte a APIs e JSON
builder.Services.AddControllers()
	.AddNewtonsoftJson(options =>
		options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);

// Adicionar controladores e vistas
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

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

app.UseCors("AllowFrontend"); // Aplicar política de CORS

app.UseAuthentication();
app.UseAuthorization();

// Criar a base de dados e popular os seeders (Roles e Users)
using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;
	var context = services.GetRequiredService<ApplicationDbContext>();
	var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
	var userManager = services.GetRequiredService<UserManager<IdentityUser>>();

	// Aplicar as migrações automaticamente
	await context.Database.MigrateAsync();

	// Chamar os seeders
	await RoleSeeder.SeedRoles(roleManager);
	await UserSeeder.SeedUsersAsync(userManager);
}

// Mapear as rotas padrão e API
app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

// Adicionar rotas para a API
app.MapControllers();

app.Run();
