using HardwareMonitorApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HardwareMonitorApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // 定義資料集 (對應到資料庫的 Table)
        public DbSet<UserAccount> UserAccounts { get; set; } = null!;
        public DbSet<DeviceInfo> Devices { get; set; } = null!;
        public DbSet<HardwareInfo> HardwareInfos { get; set; } = null!;
        public DbSet<DiskInfo> DiskInfos { get; set; } = null!;
        public DbSet<PowerLog> PowerLogs { get; set; } = null!;
        public DbSet<SoftwareInfo> SoftwareInfos { get; set; } = null!;
        public DbSet<AlertInfo> AlertInfos { get; set; } = null!;
        public DbSet<GraphicsCardInfo> GraphicsCardInfos { get; set; } = null!;
        public DbSet<CompanyInfo> CompanyInfos { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 確保 UserAccount 上的 Account 欄位是唯一的
            modelBuilder.Entity<UserAccount>()
                .HasIndex(u => u.Account)
                .IsUnique();

            // 定義 DeviceInfo 和 HardwareInfo 的一對多關係
            modelBuilder.Entity<HardwareInfo>()
                .HasOne(h => h.DeviceInfo) // HardwareInfo 有一個 DeviceInfo
                .WithMany(d => d.HardwareInfos) // DeviceInfo 有多個 HardwareInfos
                .HasForeignKey(h => h.DeviceNo); // 使用 DeviceNo 作為外鍵
            
            // 定義 DeviceInfo 和 PowerLog 的一對多關係
            modelBuilder.Entity<PowerLog>()
                .HasOne(p => p.DeviceInfo)
                .WithMany(d => d.PowerLogs)
                .HasForeignKey(p => p.DeviceNo);

            // 定義 DeviceInfo 和 SoftwareInfo 的一對多關係
            modelBuilder.Entity<SoftwareInfo>()
                .HasOne(s => s.DeviceInfo)
                .WithMany(d => d.SoftwareInfos)
                .HasForeignKey(s => s.DeviceNo);
            
            // 定義 DeviceInfo 和 AlertInfo 的一對多關係
            modelBuilder.Entity<AlertInfo>()
                .HasOne(a => a.DeviceInfo)
                .WithMany(d => d.AlertInfos)
                .HasForeignKey(a => a.DeviceNo);

            // 定義 DeviceInfo 和 GraphicsCardInfo 的一對多關係
            modelBuilder.Entity<GraphicsCardInfo>()
                .HasOne(g => g.DeviceInfo)
                .WithMany(d => d.GraphicsCardInfos)
                .HasForeignKey(g => g.DeviceNo);

            // 設定 CompanyName 的唯一索引
            modelBuilder.Entity<CompanyInfo>()
                .HasIndex(c => c.CompanyName)
                .IsUnique();
        }
    }
}