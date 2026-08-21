using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _service;
        private static readonly string[] ValidStatuses = { "available", "occupied", "maintenance" };

        public RoomsController(IRoomService service) => _service = service;

        /// <summary>Lấy danh sách phòng</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int? type, [FromQuery] string? status)
        {
            var list = await _service.GetAll(search, type, status);
            return Ok(list);
        }

        /// <summary>Lấy phòng theo ID</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound(new { message = "Không tìm thấy phòng" });
            return Ok(item);
        }

        /// <summary>Tạo phòng mới</summary>
        [HttpPost]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
        {
            if (!ValidStatuses.Contains(dto.Status))
                return BadRequest(new { message = $"Trạng thái phòng '{dto.Status}' không hợp lệ." });

            var item = await _service.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        /// <summary>Cập nhật phòng</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRoomDto dto)
        {
            if (!ValidStatuses.Contains(dto.Status))
                return BadRequest(new { message = $"Trạng thái phòng '{dto.Status}' không hợp lệ." });

            var item = await _service.Update(id, dto);
            if (item == null) return NotFound(new { message = "Không tìm thấy phòng" });
            return Ok(item);
        }

        /// <summary>Xóa phòng</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.Delete(id);
            if (!ok) return NotFound(new { message = "Không tìm thấy phòng" });
            return NoContent();
        }
    }
}
