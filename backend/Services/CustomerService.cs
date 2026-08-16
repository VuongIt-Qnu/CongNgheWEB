using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface ICustomerService
    {
        Task<List<CustomerDto>> GetAll(string? search);
        Task<CustomerDto?> GetById(int id);
        Task<CustomerDto?> GetByUserId(int userId);
        Task<CustomerDto> Create(CreateCustomerDto dto);
        Task<CustomerDto?> Update(int id, CreateCustomerDto dto);
        Task<bool> Delete(int id);
    }

    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _db;

        public CustomerService(ApplicationDbContext db) => _db = db;

        public async Task<List<CustomerDto>> GetAll(string? search)
        {
            var query = _db.Customers.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(c => c.Name.Contains(search) ||
                    (c.Phone != null && c.Phone.Contains(search)) ||
                    (c.Email != null && c.Email.Contains(search)));

            return await query.OrderByDescending(c => c.Id).Select(c => new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Phone = c.Phone,
                Email = c.Email,
                IdCard = c.IdCard,
                Address = c.Address,
                UserId = c.UserId,
                CreatedAt = c.CreatedAt
            }).ToListAsync();
        }

        public async Task<CustomerDto?> GetById(int id)
        {
            var c = await _db.Customers.FindAsync(id);
            if (c == null) return null;
            return new CustomerDto
            {
                Id = c.Id, Name = c.Name, Phone = c.Phone, Email = c.Email,
                IdCard = c.IdCard, Address = c.Address, UserId = c.UserId, CreatedAt = c.CreatedAt
            };
        }

        public async Task<CustomerDto> Create(CreateCustomerDto dto)
        {
            var entity = new Customer
            {
                Name = dto.Name, Phone = dto.Phone, Email = dto.Email,
                IdCard = dto.IdCard, Address = dto.Address,
                CreatedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
            };
            _db.Customers.Add(entity);
            await _db.SaveChangesAsync();
            return (await GetById(entity.Id))!;
        }

        public async Task<CustomerDto?> Update(int id, CreateCustomerDto dto)
        {
            var entity = await _db.Customers.FindAsync(id);
            if (entity == null) return null;
            entity.Name = dto.Name;
            entity.Phone = dto.Phone;
            entity.Email = dto.Email;
            entity.IdCard = dto.IdCard;
            entity.Address = dto.Address;
            await _db.SaveChangesAsync();
            return (await GetById(id))!;
        }

        public async Task<CustomerDto?> GetByUserId(int userId)
        {
            var c = await _db.Customers.FirstOrDefaultAsync(x => x.UserId == userId);
            if (c == null) return null;
            return new CustomerDto
            {
                Id = c.Id, Name = c.Name, Phone = c.Phone, Email = c.Email,
                IdCard = c.IdCard, Address = c.Address, UserId = c.UserId, CreatedAt = c.CreatedAt
            };
        }

        public async Task<bool> Delete(int id)
        {
            var entity = await _db.Customers.FindAsync(id);
            if (entity == null) return false;
            _db.Customers.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
