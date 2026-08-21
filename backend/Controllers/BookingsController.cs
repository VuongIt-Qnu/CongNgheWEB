using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _service;
        private readonly ICustomerService _customerService;

        public BookingsController(IBookingService service, ICustomerService customerService)
        {
            _service = service;
            _customerService = customerService;
        }

        /// <summary>Lấy danh sách đặt phòng (customer chỉ thấy đơn của chính mình)</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
        {
            if (IsCustomer(out var userId))
            {
                var listForCustomer = await _service.GetByUserId(userId);
                return Ok(listForCustomer);
            }

            var list = await _service.GetAll(status, search);
            return Ok(list);
        }

        /// <summary>Lấy đặt phòng theo ID (customer chỉ xem được đơn của chính mình)</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound(new { message = "Không tìm thấy đặt phòng" });

            if (IsCustomer(out var userId))
            {
                var myCustomer = await _customerService.GetByUserId(userId);
                if (myCustomer == null || item.CustomerId != myCustomer.Id)
                    return NotFound(new { message = "Không tìm thấy đặt phòng" });
            }

            return Ok(item);
        }

        /// <summary>Tạo đặt phòng mới</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
        {
            if (IsCustomer(out var userId))
            {
                // Customer chỉ được đặt phòng cho chính mình — bỏ qua CustomerId client gửi lên
                // để tránh giả mạo đặt hộ khách hàng khác.
                var myCustomer = await _customerService.GetByUserId(userId);
                if (myCustomer == null)
                    return BadRequest(new { message = "Không tìm thấy hồ sơ khách hàng của tài khoản này." });

                dto.CustomerId = myCustomer.Id;
            }

            if (!DateTime.TryParse(dto.CheckInDate, out var checkIn) || !DateTime.TryParse(dto.CheckOutDate, out var checkOut))
            {
                return BadRequest(new { message = "Định dạng ngày nhận phòng hoặc ngày trả phòng không hợp lệ." });
            }

            var today = DateTime.Today;
            if (checkIn.Date < today)
            {
                return BadRequest(new { message = "Ngày nhận phòng không thể là ngày trong quá khứ (phải từ hôm nay trở đi)." });
            }

            if (checkOut.Date <= checkIn.Date)
            {
                return BadRequest(new { message = "Ngày trả phòng phải lớn hơn ngày nhận phòng ít nhất 1 ngày." });
            }

            if (await _service.HasOverlappingBooking(dto.RoomId, checkIn.Date, checkOut.Date))
            {
                return BadRequest(new { message = "Phòng đã có người đặt trong khoảng thời gian này. Vui lòng chọn ngày khác hoặc phòng khác." });
            }

            var item = await _service.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        /// <summary>Cập nhật đặt phòng</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingDto dto)
        {
            var current = await _service.GetById(id);
            if (current == null) return NotFound(new { message = "Không tìm thấy đặt phòng" });

            var checkInStr = dto.CheckInDate ?? current.CheckInDate;
            var checkOutStr = dto.CheckOutDate ?? current.CheckOutDate;
            var roomId = dto.RoomId ?? current.RoomId;
            var datesOrRoomChanged = dto.CheckInDate != null || dto.CheckOutDate != null || dto.RoomId.HasValue;

            if (datesOrRoomChanged)
            {
                if (!DateTime.TryParse(checkInStr, out var checkIn) || !DateTime.TryParse(checkOutStr, out var checkOut))
                {
                    return BadRequest(new { message = "Định dạng ngày nhận phòng hoặc ngày trả phòng không hợp lệ." });
                }

                if (checkOut.Date <= checkIn.Date)
                {
                    return BadRequest(new { message = "Ngày trả phòng phải lớn hơn ngày nhận phòng ít nhất 1 ngày." });
                }

                if (await _service.HasOverlappingBooking(roomId, checkIn.Date, checkOut.Date, id))
                {
                    return BadRequest(new { message = "Phòng đã có người đặt trong khoảng thời gian này. Vui lòng chọn ngày khác hoặc phòng khác." });
                }
            }

            var (success, error, item) = await _service.Update(id, dto);
            if (!success) return BadRequest(new { message = error });
            return Ok(item);
        }

        /// <summary>Xóa đặt phòng</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.Delete(id);
            if (!ok) return NotFound(new { message = "Không tìm thấy đặt phòng" });
            return NoContent();
        }

        /// <summary>Cập nhật trạng thái đặt phòng (Admin/Staff workflow)</summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBookingStatusDto dto)
        {
            var validStatuses = new[] { "confirmed", "cancelled", "occupied", "no_show", "completed" };
            if (!validStatuses.Contains(dto.Status))
            {
                return BadRequest(new { message = $"Trạng thái '{dto.Status}' không hợp lệ." });
            }

            var (success, error, booking) = await _service.UpdateStatus(id, dto.Status);
            if (!success)
            {
                return BadRequest(new { message = error });
            }

            return Ok(booking);
        }

        /// <summary>True nếu người dùng hiện tại có role "customer"; trả kèm UserId qua out param.</summary>
        private bool IsCustomer(out int userId)
        {
            userId = 0;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "customer") return false;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out userId);
        }
    }
}
