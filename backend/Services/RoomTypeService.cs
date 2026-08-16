using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IRoomTypeService
    {
        Task<List<RoomTypeDto>> GetAll();
        Task<RoomTypeDto?> GetById(int id);
        Task<RoomTypeDto> Create(CreateRoomTypeDto dto);
        Task<RoomTypeDto?> Update(int id, CreateRoomTypeDto dto);
        Task<bool> Delete(int id);
    }

    public class RoomTypeService : IRoomTypeService
    {
        private readonly ApplicationDbContext _db;

        public RoomTypeService(ApplicationDbContext db) => _db = db;

        public async Task<List<RoomTypeDto>> GetAll()
        {
            return await _db.RoomTypes
                .Include(rt => rt.Rooms)
                .Select(rt => new RoomTypeDto
                {
                    Id = rt.Id,
                    Name = rt.Name,
                    Description = rt.Description,
                    RoomCount = rt.Rooms.Count
                })
                .ToListAsync();
        }

        public async Task<RoomTypeDto?> GetById(int id)
        {
            var rt = await _db.RoomTypes
                .Include(r => r.Rooms)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (rt == null) return null;

            return new RoomTypeDto
            {
                Id = rt.Id,
                Name = rt.Name,
                Description = rt.Description,
                RoomCount = rt.Rooms.Count
            };
        }

        public async Task<RoomTypeDto> Create(CreateRoomTypeDto dto)
        {
            var entity = new RoomType { Name = dto.Name, Description = dto.Description };
            _db.RoomTypes.Add(entity);
            await _db.SaveChangesAsync();
            return new RoomTypeDto { Id = entity.Id, Name = entity.Name, Description = entity.Description, RoomCount = 0 };
        }

        public async Task<RoomTypeDto?> Update(int id, CreateRoomTypeDto dto)
        {
            var entity = await _db.RoomTypes.FindAsync(id);
            if (entity == null) return null;

            entity.Name = dto.Name;
            entity.Description = dto.Description;
            await _db.SaveChangesAsync();

            return new RoomTypeDto { Id = entity.Id, Name = entity.Name, Description = entity.Description };
        }

        public async Task<bool> Delete(int id)
        {
            var entity = await _db.RoomTypes.FindAsync(id);
            if (entity == null) return false;

            _db.RoomTypes.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
