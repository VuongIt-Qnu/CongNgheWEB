using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _service;

        public CustomersController(ICustomerService service) => _service = service;

        /// <summary>Lấy danh sách khách hàng (chứa dữ liệu cá nhân — chỉ admin/staff)</summary>
        [HttpGet]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> GetAll([FromQuery] string? search)
        {
            var list = await _service.GetAll(search);
            return Ok(list);
        }

        /// <summary>Lấy khách hàng theo ID (chỉ admin/staff — dùng /profile cho tài khoản đang đăng nhập)</summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetById(id);
            if (item == null) return NotFound(new { message = "Không tìm thấy khách hàng" });
            return Ok(item);
        }

        /// <summary>Lấy thông tin khách hàng của tài khoản đang đăng nhập</summary>
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            if (int.TryParse(userIdClaim.Value, out int userId))
            {
                var customer = await _service.GetByUserId(userId);
                if (customer == null) return NotFound(new { message = "Không tìm thấy hồ sơ khách hàng" });
                return Ok(customer);
            }
            return BadRequest();
        }

        /// <summary>Tạo khách hàng mới</summary>
        [HttpPost]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            var item = await _service.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        /// <summary>Cập nhật khách hàng</summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateCustomerDto dto)
        {
            var item = await _service.Update(id, dto);
            if (item == null) return NotFound(new { message = "Không tìm thấy khách hàng" });
            return Ok(item);
        }

        /// <summary>Xóa khách hàng</summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var ok = await _service.Delete(id);
            if (!ok) return NotFound(new { message = "Không tìm thấy khách hàng" });
            return NoContent();
        }
    }
}
