/**
 * Kiểm thử tích hợp — Rooms API
 *
 * GET /api/rooms và GET /api/rooms/:id là public (không cần auth).
 * POST /api/rooms, PUT, DELETE yêu cầu auth + role admin/staff.
 *
 * Dùng tài khoản admin được seed sẵn: admin@example.com / admin123
 */

const { setTestEnv } = require('./helpers/testDb');
setTestEnv();

const request = require('supertest');
const { setupTestDb, teardownTestDb } = require('./helpers/testDb');

let app;
let adminToken;

beforeAll(async () => {
  await setupTestDb();
  app = require('../server');

  // Đăng nhập bằng admin được seed sẵn (role 'admin' thật trong DB)
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });

  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await teardownTestDb();
});

// ─────────────────────────────────────────────────────────────
// GET /api/rooms (public route)
// ─────────────────────────────────────────────────────────────
describe('GET /api/rooms', () => {
  it('nên trả về danh sách phòng mà không cần xác thực', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
  });

  it('nên trả về đúng cấu trúc dữ liệu có thuộc tính rooms', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rooms');
    expect(Array.isArray(res.body.rooms)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
  });

  it('nên trả về danh sách phòng từ seed data', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(res.body.rooms.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/rooms/available (public route)
// ─────────────────────────────────────────────────────────────
describe('GET /api/rooms/available', () => {
  it('nên trả về 400 khi thiếu check_in_date và check_out_date', async () => {
    const res = await request(app).get('/api/rooms/available');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('nên trả về danh sách phòng trống khi có đủ tham số', async () => {
    const res = await request(app).get(
      '/api/rooms/available?check_in_date=2025-12-10&check_out_date=2025-12-15'
    );
    expect(res.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/rooms/:id (public route)
// ─────────────────────────────────────────────────────────────
describe('GET /api/rooms/:id', () => {
  it('nên trả về 404 khi ID phòng không tồn tại', async () => {
    const res = await request(app).get('/api/rooms/999999');
    expect(res.status).toBe(404);
  });

  it('nên trả về thông tin phòng khi ID hợp lệ tồn tại (từ seed data)', async () => {
    const listRes = await request(app).get('/api/rooms');
    const rooms = listRes.body.rooms || [];
    if (rooms.length > 0) {
      const roomId = rooms[0].id;
      const res = await request(app).get(`/api/rooms/${roomId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', roomId);
      expect(res.body).toHaveProperty('room_number');
      expect(res.body).toHaveProperty('price');
    }
  });

  it('nên trả về 404 khi ID không phải số hợp lệ', async () => {
    const res = await request(app).get('/api/rooms/abc-invalid');
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/rooms (yêu cầu auth + admin/staff)
// ─────────────────────────────────────────────────────────────
describe('POST /api/rooms', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ room_number: '999', room_type_id: 1, price: 1000000 });
    expect(res.status).toBe(401);
  });

  it('nên trả về 422 khi thiếu room_number', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ room_type_id: 1, price: 1000000 });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors.some((e) => e.field === 'room_number')).toBe(true);
  });

  it('nên trả về 422 khi thiếu room_type_id', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ room_number: 'T01', price: 1000000 });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('nên trả về 422 khi giá phòng không hợp lệ (âm hoặc bằng 0)', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ room_number: 'T02', room_type_id: 1, price: -500 });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'price')).toBe(true);
  });

  it('nên trả về 422 khi thiếu giá phòng', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ room_number: 'T03', room_type_id: 1 });
    expect(res.status).toBe(422);
  });

  it('nên tạo phòng thành công với dữ liệu hợp lệ', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ room_number: 'TEST-001', room_type_id: 1, price: 1500000, capacity: 2 });

    // 201 thành công, 409 nếu trùng số phòng
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('room_number', 'TEST-001');
      expect(res.body).toHaveProperty('price', 1500000);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// PUT /api/rooms/:id (yêu cầu auth + admin/staff)
// ─────────────────────────────────────────────────────────────
describe('PUT /api/rooms/:id', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app)
      .put('/api/rooms/1')
      .send({ status: 'maintenance' });
    expect(res.status).toBe(401);
  });

  it('nên trả về 422 khi trạng thái không hợp lệ', async () => {
    const res = await request(app)
      .put('/api/rooms/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'trang-thai-sai' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'status')).toBe(true);
  });

  it('nên cập nhật thành công trạng thái phòng hợp lệ', async () => {
    const listRes = await request(app).get('/api/rooms');
    const rooms = listRes.body.rooms || [];
    if (rooms.length > 0) {
      const room = rooms[0];
      // updateRoom model yêu cầu đủ các field bắt buộc
      const res = await request(app)
        .put(`/api/rooms/${room.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          room_number: room.room_number,
          room_type_id: room.room_type_id,
          price: room.price,
          capacity: room.capacity || 1,
          status: 'maintenance',
          description: room.description || '',
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'maintenance');
    }
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/rooms/:id (yêu cầu auth + admin/staff)
// ─────────────────────────────────────────────────────────────
describe('DELETE /api/rooms/:id', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app).delete('/api/rooms/1');
    expect(res.status).toBe(401);
  });

  it('nên trả về 204 khi xóa phòng (kể cả ID không tồn tại — controller không check)', async () => {
    const res = await request(app)
      .delete('/api/rooms/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    // deleteRoom controller không check exists trước khi xóa
    expect(res.status).toBe(204);
  });
});
