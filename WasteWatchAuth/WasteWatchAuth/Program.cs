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
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.None; // Must match the SameSite mode in CookieOptions
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Must match the Secure flag in CookieOptions
    options.ExpireTimeSpan = TimeSpan.FromMinutes(30); // Session expiration
    options.SlidingExpiration = true;
    options.LoginPath = "/Identity/Account/Login";
    options.AccessDeniedPath = "/Identity/Account/AccessDenied";
});

// Configuração para sessões
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Expiração de sessão
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Habilitar CORS para permitir conexões do frontend específico
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // Replace with your frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Allow credentials (cookies)
    });
});

// Registrar o serviço de envio de emails (para recuperação de senha)
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

// Apply CORS policy before authentication and authorization
app.UseCors("AllowFrontend");

app.UseSession(); // Habilitar o uso de sessão
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
