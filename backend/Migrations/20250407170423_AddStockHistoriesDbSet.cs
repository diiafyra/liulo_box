using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddStockHistoriesDbSet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockDetail_FoodDrinks_FoodDrinkId",
                table: "StockDetail");

            migrationBuilder.DropForeignKey(
                name: "FK_StockDetail_StockHistory_StockHistoryId",
                table: "StockDetail");

            migrationBuilder.DropForeignKey(
                name: "FK_StockHistory_Users_CreatedBy",
                table: "StockHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StockHistory",
                table: "StockHistory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StockDetail",
                table: "StockDetail");

            migrationBuilder.RenameTable(
                name: "StockHistory",
                newName: "StockHistories");

            migrationBuilder.RenameTable(
                name: "StockDetail",
                newName: "StockDetails");

            migrationBuilder.RenameIndex(
                name: "IX_StockHistory_CreatedBy",
                table: "StockHistories",
                newName: "IX_StockHistories_CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_StockDetail_StockHistoryId",
                table: "StockDetails",
                newName: "IX_StockDetails_StockHistoryId");

            migrationBuilder.RenameIndex(
                name: "IX_StockDetail_FoodDrinkId",
                table: "StockDetails",
                newName: "IX_StockDetails_FoodDrinkId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StockHistories",
                table: "StockHistories",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StockDetails",
                table: "StockDetails",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockDetails_FoodDrinks_FoodDrinkId",
                table: "StockDetails",
                column: "FoodDrinkId",
                principalTable: "FoodDrinks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockDetails_StockHistories_StockHistoryId",
                table: "StockDetails",
                column: "StockHistoryId",
                principalTable: "StockHistories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockHistories_Users_CreatedBy",
                table: "StockHistories",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockDetails_FoodDrinks_FoodDrinkId",
                table: "StockDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_StockDetails_StockHistories_StockHistoryId",
                table: "StockDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_StockHistories_Users_CreatedBy",
                table: "StockHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StockHistories",
                table: "StockHistories");

            migrationBuilder.DropPrimaryKey(
                name: "PK_StockDetails",
                table: "StockDetails");

            migrationBuilder.RenameTable(
                name: "StockHistories",
                newName: "StockHistory");

            migrationBuilder.RenameTable(
                name: "StockDetails",
                newName: "StockDetail");

            migrationBuilder.RenameIndex(
                name: "IX_StockHistories_CreatedBy",
                table: "StockHistory",
                newName: "IX_StockHistory_CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_StockDetails_StockHistoryId",
                table: "StockDetail",
                newName: "IX_StockDetail_StockHistoryId");

            migrationBuilder.RenameIndex(
                name: "IX_StockDetails_FoodDrinkId",
                table: "StockDetail",
                newName: "IX_StockDetail_FoodDrinkId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StockHistory",
                table: "StockHistory",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_StockDetail",
                table: "StockDetail",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_StockDetail_FoodDrinks_FoodDrinkId",
                table: "StockDetail",
                column: "FoodDrinkId",
                principalTable: "FoodDrinks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockDetail_StockHistory_StockHistoryId",
                table: "StockDetail",
                column: "StockHistoryId",
                principalTable: "StockHistory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StockHistory_Users_CreatedBy",
                table: "StockHistory",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
