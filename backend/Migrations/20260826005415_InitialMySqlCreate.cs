using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialMySqlCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "room_types",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_room_types", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "services",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    price = table.Column<double>(type: "double", nullable: false),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_services", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    password = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    role = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    phone = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    address = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_active = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "rooms",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    room_number = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    room_type_id = table.Column<int>(type: "int", nullable: false),
                    price = table.Column<double>(type: "double", nullable: false),
                    capacity = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_rooms", x => x.id);
                    table.ForeignKey(
                        name: "FK_rooms_room_types_room_type_id",
                        column: x => x.room_type_id,
                        principalTable: "room_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    phone = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    id_card = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    address = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.id);
                    table.ForeignKey(
                        name: "FK_customers_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "bookings",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    room_id = table.Column<int>(type: "int", nullable: false),
                    check_in_date = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    check_out_date = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    total_price = table.Column<double>(type: "double", nullable: false),
                    notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    updated_at = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bookings", x => x.id);
                    table.ForeignKey(
                        name: "FK_bookings_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_bookings_rooms_room_id",
                        column: x => x.room_id,
                        principalTable: "rooms",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    booking_id = table.Column<int>(type: "int", nullable: false),
                    amount = table.Column<double>(type: "double", nullable: false),
                    method = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    transaction_code = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    paid_at = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_payments", x => x.id);
                    table.ForeignKey(
                        name: "FK_payments_bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "customers",
                columns: new[] { "id", "address", "created_at", "email", "id_card", "name", "phone", "user_id" },
                values: new object[,]
                {
                    { 1, "TP.HCM", "2026-01-15 10:00:00", "nguyenvana@gmail.com", "079123456789", "Nguyễn Văn A", "0901234567", null },
                    { 2, "Hà Nội", "2026-02-20 14:30:00", "tranthib@gmail.com", "079987654321", "Trần Thị B", "0912345678", null },
                    { 3, "Đà Nẵng", "2026-03-10 09:15:00", "levanc@gmail.com", "079111222333", "Lê Văn C", "0923456789", null }
                });

            migrationBuilder.InsertData(
                table: "room_types",
                columns: new[] { "id", "description", "name" },
                values: new object[,]
                {
                    { 1, "Phòng tiêu chuẩn tối giản, đủ tiện nghi cho công tác ngắn.", "Phòng Tiêu Chuẩn" },
                    { 2, "Không gian rộng hơn, khu vực làm việc và sofa nhỏ.", "Phòng Cao Cấp" },
                    { 3, "View biển panorama, ban công riêng.", "Phòng Hướng Biển" },
                    { 4, "Suite phòng khách riêng, bồn tắm và minibar cao cấp.", "Phòng Suite Sang Trọng" },
                    { 5, "Hai phòng ngủ thông nhau, lý tưởng cho gia đình.", "Phòng Gia Đình" },
                    { 6, "Penthouse tầng cao, dịch vụ concierge riêng.", "Phòng VIP Thượng Hạng" }
                });

            migrationBuilder.InsertData(
                table: "services",
                columns: new[] { "id", "description", "name", "price" },
                values: new object[,]
                {
                    { 1, "06:30–10:30 tại nhà hàng The Pearl.", "Buffet sáng quốc tế", 350000.0 },
                    { 2, "Massage body & aromatic oil.", "Spa relaxation 60 phút", 950000.0 },
                    { 3, "Xe limousine 7 chỗ, đặt trước 4h.", "Đưa đón sân bay (một chiều)", 480000.0 },
                    { 4, "Nhận trong ngày tùy khối lượng.", "Giặt ủi express", 150000.0 },
                    { 5, "Đồ uống & snack refill theo menu.", "Minibar package", 420000.0 }
                });

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "id", "address", "created_at", "email", "is_active", "name", "password", "phone", "role" },
                values: new object[] { 1, null, "2026-01-01 00:00:00", "admin@example.com", 1, "Admin", "$2a$11$5PlfRU/P6ZR714i/xz54GuBxv3EqpdI.lBNGq9kwsTRo3Tq7i3X0e", null, "admin" });

            migrationBuilder.InsertData(
                table: "rooms",
                columns: new[] { "id", "capacity", "description", "price", "room_number", "room_type_id", "status" },
                values: new object[,]
                {
                    { 1, 2, "Tone trắng và gỗ sồi; cửa sổ nhìn ra vườn zen nội khu.", 1890000.0, "801", 1, "available" },
                    { 2, 2, "Giường queen, chăn duvet cotton organic.", 1950000.0, "802", 1, "available" },
                    { 3, 3, "Không gian chia vùng sống & ngủ, desk ergonomic.", 2650000.0, "903", 2, "available" },
                    { 4, 3, "Đang có khách — có thể chọn ngày khác.", 2750000.0, "904", 2, "occupied" },
                    { 5, 3, "Lan can kính, view bình minh và resort pool.", 4200000.0, "1201", 3, "available" },
                    { 6, 4, "Ban công lớn, outdoor lounge nhỏ.", 4350000.0, "1205", 3, "available" },
                    { 7, 4, "Living riêng, Nespresso bar, bồn tắm freestanding.", 5890000.0, "1508", 4, "available" },
                    { 8, 4, "Corner suite hai hướng cửa sổ, mood lighting.", 6100000.0, "1510", 4, "available" },
                    { 9, 5, "Twin + queen, vách di động, kệ đồ chơi cho trẻ.", 3490000.0, "608", 5, "available" },
                    { 10, 6, "Duplex penthouse, jacuzzi và lounge riêng.", 8990000.0, "1801", 6, "available" }
                });

            migrationBuilder.InsertData(
                table: "bookings",
                columns: new[] { "id", "check_in_date", "check_out_date", "created_at", "customer_id", "notes", "room_id", "status", "total_price", "updated_at" },
                values: new object[,]
                {
                    { 1, "2026-08-20", "2026-08-23", "2026-08-15 10:00:00", 1, null, 1, "confirmed", 5670000.0, null },
                    { 2, "2026-08-15", "2026-08-18", "2026-08-10 14:30:00", 2, null, 4, "occupied", 8250000.0, null },
                    { 3, "2026-09-01", "2026-09-05", "2026-08-12 09:00:00", 3, null, 5, "pending", 16800000.0, null }
                });

            migrationBuilder.InsertData(
                table: "payments",
                columns: new[] { "id", "amount", "booking_id", "created_at", "method", "notes", "paid_at", "status", "transaction_code" },
                values: new object[,]
                {
                    { 1, 2000000.0, 1, "2026-08-15 10:05:00", "bank_transfer", "Đặt cọc giữ phòng", "2026-08-15 10:06:00", "completed", "PAY-20260815-0001" },
                    { 2, 8250000.0, 2, "2026-08-10 14:35:00", "cash", "Thanh toán đủ tại quầy", "2026-08-10 14:40:00", "completed", "PAY-20260810-0002" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_bookings_customer_id",
                table: "bookings",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "IX_bookings_room_id",
                table: "bookings",
                column: "room_id");

            migrationBuilder.CreateIndex(
                name: "IX_customers_user_id",
                table: "customers",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_payments_booking_id",
                table: "payments",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_rooms_room_number",
                table: "rooms",
                column: "room_number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_rooms_room_type_id",
                table: "rooms",
                column: "room_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "services");

            migrationBuilder.DropTable(
                name: "bookings");

            migrationBuilder.DropTable(
                name: "customers");

            migrationBuilder.DropTable(
                name: "rooms");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "room_types");
        }
    }
}
