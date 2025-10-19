using HardwareMonitorApi.Data;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using HardwareMonitorApi.Services; // 假設您將 Auth 服務放在此命名空間
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// --- 1. 資料庫配置 (EF Core + MySQL) ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.Create(8, 0, 30, ServerType.MySql) // 根據您的 MySQL 版本調整
    )
);

// --- 2. 服務註冊 ---
builder.Services.AddControllers();
builder.Services.AddScoped<IAuthService, AuthService>(); // 註冊身份驗證服務 (將在步驟 5 建立)

// --- 3. JWT 身份驗證配置 ---
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero // Token 過期時間不容許誤差
    };
});

// -------------------- 服務配置階段 --------------------
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            // 替換成您前端的實際地址。如果使用 Vite，通常是 5173 端口。
            policy.WithOrigins(
                        "http://localhost:5173", 
                        "http://127.0.0.1:5173"
                    )
                    // **【關鍵】**：必須允許所有方法，特別是 OPTIONS
                    .AllowAnyMethod() 
                    // **【關鍵】**：必須允許所有 Header，包含 Authorization (Bearer Token)
                    .AllowAnyHeader(); 
        });
});

// --- 4. Swagger/OpenAPI 配置 (支援 JWT) ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "鴻盛資訊安全管理系統 API", Version = "v1" });

    // 啟用 Swagger 支援 JWT 身份驗證
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "請輸入 JWT 格式: Bearer {token}",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


var app = builder.Build();

// --- 5. 應用程式配置 ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "鴻盛資訊安全管理系統 API v1");
    });
}

app.UseHttpsRedirection();
app.UseCors(MyAllowSpecificOrigins); // 使用 CORS 策略
app.UseAuthentication(); // 必須在 UseAuthorization 之前
app.UseAuthorization();

app.MapControllers();

app.Run();