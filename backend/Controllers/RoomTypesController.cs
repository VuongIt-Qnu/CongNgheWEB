using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomTypesController : ControllerBase
    {
        private readonly IRoomTypeService _service;

        public RoomTypesController(IRoomTypeService service) => _service = service;

        /// <summary>Lấy danh sách loại phòng</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _service.GetAll();
            return Ok(list);
        }

        /// <summary>Lấy loại phòng theo ID</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound(new { message = "Không tìm thấy loại phòng" });
            return Ok(item);
        }

        /// <summary>Tạo loại phòng mới</summary>
        [HttpPost]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Create([FromBody] CreateRoomTypeDto dto)
        {
            var item = await _service.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        /// <summary>Cập nhật loại phòng</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateRoomTypeDto dto)
        {
            var item = await _service.Update(id, dto);
            if (item == null) return NotFound(new { message = "Không tìm thấy loại phòng" });
            return Ok(item);
        }

        /// <summary>Xóa loại phòng</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.Delete(id);
            if (!ok) return NotFound(new { message = "Không tìm thấy loại phòng" });
            return NoContent();
        }
    }
}
