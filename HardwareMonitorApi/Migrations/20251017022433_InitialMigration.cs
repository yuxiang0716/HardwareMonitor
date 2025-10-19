using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HardwareMonitorApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    DeviceNo = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ComputerName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OperatingSystem = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SoftwareCount = table.Column<int>(type: "int", nullable: false),
                    User = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Initializer = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Version = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RegistrationDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    RegistrationStatus = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.DeviceNo);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Account = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PasswordHash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Role = table.Column<int>(type: "int", nullable: false),
                    CompanyName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => x.UserId);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "AlertInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DeviceNo = table.Column<string>(type: "varchar(50)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    AlertDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CpuT = table.Column<double>(type: "double", nullable: false),
                    MotherboardT = table.Column<double>(type: "double", nullable: false),
                    GpuT = table.Column<double>(type: "double", nullable: false),
                    HddT = table.Column<double>(type: "double", nullable: false),
                    CpuU = table.Column<double>(type: "double", nullable: false),
                    MemoryU = table.Column<double>(type: "double", nullable: false),
                    GpuU = table.Column<double>(type: "double", nullable: false),
                    HddU = table.Column<double>(type: "double", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlertInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AlertInfos_Devices_DeviceNo",
                        column: x => x.DeviceNo,
                        principalTable: "Devices",
                        principalColumn: "DeviceNo",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DiskInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DeviceNo = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SlotName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TotalCapacityGB = table.Column<long>(type: "bigint", nullable: false),
                    AvailableCapacityGB = table.Column<long>(type: "bigint", nullable: false),
                    DeviceInfoDeviceNo = table.Column<string>(type: "varchar(50)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DiskInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DiskInfos_Devices_DeviceInfoDeviceNo",
                        column: x => x.DeviceInfoDeviceNo,
                        principalTable: "Devices",
                        principalColumn: "DeviceNo");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "GraphicsCardInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DeviceNo = table.Column<string>(type: "varchar(50)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CardName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GraphicsCardInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GraphicsCardInfos_Devices_DeviceNo",
                        column: x => x.DeviceNo,
                        principalTable: "Devices",
                        principalColumn: "DeviceNo",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HardwareInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DeviceNo = table.Column<string>(type: "varchar(50)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Processor = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Motherboard = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MemoryTotalGB = table.Column<long>(type: "bigint", nullable: false),
                    MemoryAvailableGB = table.Column<long>(type: "bigint", nullable: false),
                    IPAddress = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdateDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HardwareInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HardwareInfos_Devices_DeviceNo",
                        column: x => x.DeviceNo,
                        principalTable: "Devices",
                        principalColumn: "DeviceNo",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PowerLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DeviceNo = table.Column<string>(type: "varchar(50)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Timestamp = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Action = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PowerLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PowerLogs_Devices_DeviceNo",
                        column: x => x.DeviceNo,
                        principalTable: "Devices",
                        principalColumn: "DeviceNo",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "SoftwareInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DeviceNo = table.Column<string>(type: "varchar(50)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SoftwareName = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Publisher = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    InstallationDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Version = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SoftwareInfos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SoftwareInfos_Devices_DeviceNo",
                        column: x => x.DeviceNo,
                        principalTable: "Devices",
                        principalColumn: "DeviceNo",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_AlertInfos_DeviceNo",
                table: "AlertInfos",
                column: "DeviceNo");

            migrationBuilder.CreateIndex(
                name: "IX_DiskInfos_DeviceInfoDeviceNo",
                table: "DiskInfos",
                column: "DeviceInfoDeviceNo");

            migrationBuilder.CreateIndex(
                name: "IX_GraphicsCardInfos_DeviceNo",
                table: "GraphicsCardInfos",
                column: "DeviceNo");

            migrationBuilder.CreateIndex(
                name: "IX_HardwareInfos_DeviceNo",
                table: "HardwareInfos",
                column: "DeviceNo");

            migrationBuilder.CreateIndex(
                name: "IX_PowerLogs_DeviceNo",
                table: "PowerLogs",
                column: "DeviceNo");

            migrationBuilder.CreateIndex(
                name: "IX_SoftwareInfos_DeviceNo",
                table: "SoftwareInfos",
                column: "DeviceNo");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_Account",
                table: "UserAccounts",
                column: "Account",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlertInfos");

            migrationBuilder.DropTable(
                name: "DiskInfos");

            migrationBuilder.DropTable(
                name: "GraphicsCardInfos");

            migrationBuilder.DropTable(
                name: "HardwareInfos");

            migrationBuilder.DropTable(
                name: "PowerLogs");

            migrationBuilder.DropTable(
                name: "SoftwareInfos");

            migrationBuilder.DropTable(
                name: "UserAccounts");

            migrationBuilder.DropTable(
                name: "Devices");
        }
    }
}
