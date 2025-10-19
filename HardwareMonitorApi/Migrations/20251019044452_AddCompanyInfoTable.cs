using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HardwareMonitorApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyInfoTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyInfoCompanyCode",
                table: "Devices",
                type: "varchar(50)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CompanyInfos",
                columns: table => new
                {
                    CompanyCode = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CompanyName = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RegistrationLimit = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdateDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyInfos", x => x.CompanyCode);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_CompanyInfoCompanyCode",
                table: "Devices",
                column: "CompanyInfoCompanyCode");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyInfos_CompanyName",
                table: "CompanyInfos",
                column: "CompanyName",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Devices_CompanyInfos_CompanyInfoCompanyCode",
                table: "Devices",
                column: "CompanyInfoCompanyCode",
                principalTable: "CompanyInfos",
                principalColumn: "CompanyCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Devices_CompanyInfos_CompanyInfoCompanyCode",
                table: "Devices");

            migrationBuilder.DropTable(
                name: "CompanyInfos");

            migrationBuilder.DropIndex(
                name: "IX_Devices_CompanyInfoCompanyCode",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "CompanyInfoCompanyCode",
                table: "Devices");
        }
    }
}
