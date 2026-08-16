using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _service;

        public BookingsController(IBookingService service) => _service = service;

        /// <summary>Lấy danh sách đặt phòng</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
        {
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role);
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

            if (roleClaim != null && roleClaim.Value == "customer" && userIdClaim != null)
            {
                if (int.TryParse(userIdClaim.Value, out int userId))
                {
                    var listForCustomer = await _service.GetByUserId(userId);
                    return Ok(listForCustomer);
                }
            }

            var list = await _service.GetAll(status, search);
            return Ok(list);
        }

        /// <summary>Lấy đặt phòng theo ID</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound(new { message = "Không tìm thấy đặt phòng" });
            return Ok(item);
        }

        /// <summary>Tạo đặt phòng mới</summary>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
        {
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

            var item = await _service.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        /// <summary>Cập nhật đặt phòng</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateBookingDto dto)
        {
            if (dto.CheckInDate != null || dto.CheckOutDate != null)
            {
                var current = await _service.GetById(id);
                if (current == null) return NotFound(new { message = "Không tìm thấy đặt phòng" });

                var checkInStr = dto.CheckInDate ?? current.CheckInDate;
                var checkOutStr = dto.CheckOutDate ?? current.CheckOutDate;

                if (!DateTime.TryParse(checkInStr, out var checkIn) || !DateTime.TryParse(checkOutStr, out var checkOut))
                {
                    return BadRequest(new { message = "Định dạng ngày nhận phòng hoặc ngày trả phòng không hợp lệ." });
                }

                if (checkOut.Date <= checkIn.Date)
                {
                    return BadRequest(new { message = "Ngày trả phòng phải lớn hơn ngày nhận phòng ít nhất 1 ngày." });
                }
            }

            var item = await _service.Update(id, dto);
            if (item == null) return NotFound(new { message = "Không tìm thấy đặt phòng" });
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
    }
}
