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
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _service;
        private readonly IBookingService _bookingService;
        private readonly ICustomerService _customerService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(
            IPaymentService service,
            IBookingService bookingService,
            ICustomerService customerService,
            ILogger<PaymentsController> logger)
        {
            _service = service;
            _bookingService = bookingService;
            _customerService = customerService;
            _logger = logger;
        }

        /// <summary>Lấy danh sách giao dịch thanh toán (chỉ admin/staff — dùng để đối soát toàn hệ thống)</summary>
        [HttpGet]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] int? bookingId)
        {
            var list = await _service.GetAll(status, bookingId);
            return Ok(list);
        }

        /// <summary>Lấy lịch sử thanh toán của 1 đơn đặt phòng (customer chỉ xem được đơn của chính mình)</summary>
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetByBooking(int bookingId)
        {
            if (!await CanAccessBooking(bookingId))
                return NotFound(new { message = "Không tìm thấy đặt phòng." });

            var list = await _service.GetByBookingId(bookingId);
            return Ok(list);
        }

        /// <summary>Tạo yêu cầu thanh toán mới cho 1 đơn đặt phòng (trạng thái ban đầu: pending, chờ staff xác nhận)</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
        {
            if (!await CanAccessBooking(dto.BookingId))
                return NotFound(new { message = "Không tìm thấy đặt phòng." });

            var (success, error, payment) = await _service.Create(dto);
            if (!success)
            {
                _logger.LogWarning("Tạo thanh toán thất bại cho BookingId={BookingId}: {Error}", dto.BookingId, error);
                return BadRequest(new { message = error });
            }

            _logger.LogInformation("Tạo thanh toán #{PaymentId} ({Amount}₫, {Method}) cho BookingId={BookingId}", payment!.Id, payment.Amount, payment.Method, dto.BookingId);
            return CreatedAtAction(nameof(GetById), new { id = payment!.Id }, payment);
        }

        /// <summary>Lấy chi tiết 1 giao dịch thanh toán (customer chỉ xem được giao dịch của đơn mình)</summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payment = await _service.GetById(id);
            if (payment == null) return NotFound(new { message = "Không tìm thấy giao dịch thanh toán." });

            if (!await CanAccessBooking(payment.BookingId))
                return NotFound(new { message = "Không tìm thấy giao dịch thanh toán." });

            return Ok(payment);
        }

        /// <summary>Xác nhận / từ chối / hoàn tiền giao dịch (chỉ admin/staff — staff xác nhận đã nhận tiền mặt/chuyển khoản)</summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin,staff")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePaymentStatusDto dto)
        {
            var (success, error, payment) = await _service.UpdateStatus(id, dto.Status, dto.Notes);
            if (!success)
            {
                _logger.LogWarning("Cập nhật trạng thái thanh toán #{PaymentId} thất bại: {Error}", id, error);
                return BadRequest(new { message = error });
            }

            _logger.LogInformation("Thanh toán #{PaymentId} chuyển sang trạng thái '{Status}'", id, dto.Status);
            return Ok(payment);
        }

        /// <summary>True nếu người dùng hiện tại được phép thao tác trên booking này (admin/staff: luôn true; customer: chỉ đơn của chính mình).</summary>
        private async Task<bool> CanAccessBooking(int bookingId)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "customer") return true;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId)) return false;

            var myCustomer = await _customerService.GetByUserId(userId);
            if (myCustomer == null) return false;

            var booking = await _bookingService.GetById(bookingId);
            return booking != null && booking.CustomerId == myCustomer.Id;
        }
    }
}
