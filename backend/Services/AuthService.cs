using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> Login(LoginDto dto);
        Task<AuthResponseDto?> Register(RegisterDto dto);
    }

    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<AuthResponseDto?> Login(LoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                return null;

            // Automatically create Customer record if not exists for customer role
            if (user.Role == "customer")
            {
                var customerExists = await _db.Customers.AnyAsync(c => c.UserId == user.Id);
                if (!customerExists)
                {
                    var customer = new Customer
                    {
                        Name = user.Name,
                        Email = user.Email,
                        Phone = user.Phone,
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                    };
                    _db.Customers.Add(customer);
                    await _db.SaveChangesAsync();
                }
            }

            var token = GenerateToken(user);
            return new AuthResponseDto
            {
                Token = token,
                User = MapToDto(user)
            };
        }

        public async Task<AuthResponseDto?> Register(RegisterDto dto)
        {
            var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists) return null;

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "customer",
                Phone = dto.Phone ?? "",
                IsActive = 1,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Link User to a new Customer record
            var customer = new Customer
            {
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                UserId = user.Id,
                CreatedAt = user.CreatedAt
            };
            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();

            var token = GenerateToken(user);
            return new AuthResponseDto
            {
                Token = token,
                User = MapToDto(user)
            };
        }

        private string GenerateToken(User user)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "aUr0r4_r3s0rt_S3cr3T_2026xK9pMzQ7wB5n"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"] ?? "AuroraResort",
                audience: _config["Jwt:Audience"] ?? "AuroraResortApp",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static UserDto MapToDto(User u) => new()
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            Role = u.Role,
            Phone = u.Phone,
            Address = u.Address,
            IsActive = u.IsActive
        };
    }
}
