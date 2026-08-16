using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IRoomService
    {
        Task<List<RoomDto>> GetAll(string? search, int? typeId, string? status);
        Task<RoomDto?> GetById(int id);
        Task<RoomDto> Create(CreateRoomDto dto);
        Task<RoomDto?> Update(int id, UpdateRoomDto dto);
        Task<bool> Delete(int id);
    }

    public class RoomService : IRoomService
    {
        private readonly ApplicationDbContext _db;

        public RoomService(ApplicationDbContext db) => _db = db;

        public async Task<List<RoomDto>> GetAll(string? search, int? typeId, string? status)
        {
            var query = _db.Rooms.Include(r => r.RoomType).AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(r => r.RoomNumber.Contains(search) ||
                    (r.Description != null && r.Description.Contains(search)));

            if (typeId.HasValue)
                query = query.Where(r => r.RoomTypeId == typeId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(r => r.Status == status);

            return await query
                .OrderBy(r => r.Price)
                .Select(r => new RoomDto
                {
                    Id = r.Id,
                    RoomNumber = r.RoomNumber,
                    RoomTypeId = r.RoomTypeId,
                    RoomTypeName = r.RoomType != null ? r.RoomType.Name : "",
                    Price = r.Price,
                    Capacity = r.Capacity,
                    Status = r.Status,
                    Description = r.Description
                })
                .ToListAsync();
        }

        public async Task<RoomDto?> GetById(int id)
        {
            var r = await _db.Rooms.Include(r => r.RoomType).FirstOrDefaultAsync(r => r.Id == id);
            if (r == null) return null;

            return new RoomDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                RoomTypeId = r.RoomTypeId,
                RoomTypeName = r.RoomType?.Name ?? "",
                Price = r.Price,
                Capacity = r.Capacity,
                Status = r.Status,
                Description = r.Description
            };
        }

        public async Task<RoomDto> Create(CreateRoomDto dto)
        {
            var entity = new Room
            {
                RoomNumber = dto.RoomNumber,
                RoomTypeId = dto.RoomTypeId,
                Price = dto.Price,
                Capacity = dto.Capacity,
                Status = dto.Status,
                Description = dto.Description
            };
            _db.Rooms.Add(entity);
            await _db.SaveChangesAsync();
            return (await GetById(entity.Id))!;
        }

        public async Task<RoomDto?> Update(int id, UpdateRoomDto dto)
        {
            var entity = await _db.Rooms.FindAsync(id);
            if (entity == null) return null;

            entity.RoomNumber = dto.RoomNumber;
            entity.RoomTypeId = dto.RoomTypeId;
            entity.Price = dto.Price;
            entity.Capacity = dto.Capacity;
            entity.Status = dto.Status;
            entity.Description = dto.Description;
            await _db.SaveChangesAsync();
            return (await GetById(id))!;
        }

        public async Task<bool> Delete(int id)
        {
            var entity = await _db.Rooms.FindAsync(id);
            if (entity == null) return false;
            _db.Rooms.Remove(entity);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
