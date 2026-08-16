using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IServiceService
    {
        Task<List<ServiceDto>> GetAll();
        Task<ServiceDto?> GetById(int id);
        Task<ServiceDto> Create(CreateServiceDto dto);
        Task<ServiceDto?> Update(int id, CreateServiceDto dto);
        Task<bool> Delete(int id);
    }

    public class ServiceService : IServiceService
    {
        private readonly ApplicationDbContext _db;

        public ServiceService(ApplicationDbContext db) => _db = db;

        public async Task<List<ServiceDto>> GetAll()
        {
            return await _db.Services.OrderBy(s => s.Id).Select(s => new ServiceDto
            {
                Id = s.Id, Name = s.Name, Price = s.Price, Description = s.Description
            }).ToListAsync();
        }

        public async Task<ServiceDto?> GetById(int id)
        {
            var s = await _db.Services.FindAsync(id);
            if (s == null) return null;
            return new ServiceDto { Id = s.Id, Name = s.Name, Price = s.Price, Description = s.Description };
        }

        public async Task<ServiceDto> Create(CreateServiceDto dto)
        {
            var entity = new Service { Name = dto.Name, Price = dto.Price, Description = dto.Description };
            _db.Services.Add(entity);
            await _db.SaveChangesAsync();
            return new ServiceDto { Id = entity.Id, Name = entity.Name, Price = entity.Price, Description = entity.Description };
        }

        public async Task<ServiceDto?> Update(int id, CreateServiceDto dto)
        {
            var entity = await _db.Services.FindAsync(id);
            if (entity == null) return null;
            entity.Name = dto.Name;
            entity.Price = dto.Price;
            entity.Description = dto.Description;
            await _db.SaveChangesAsync();
            return new ServiceDto { Id = entity.Id, Name = entity.Name, Price = entity.Price, Description = entity.Description };
        }

        public async Task<bool> Delete(int id)
        {
            var entity = await _db.Services.FindAsync(id);
            if (entity == null) return false;
            _db.Services.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
