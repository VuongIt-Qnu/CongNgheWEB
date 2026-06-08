/**
 * Kiểm thử tích hợp — Bookings API
 *
 * Tất cả các route đều yêu cầu xác thực.
 * Dùng tài khoản admin seed sẵn cho các route cần quyền admin/staff.
 */

const { setTestEnv } = require('./helpers/testDb');
setTestEnv();

const request = require('supertest');
const { setupTestDb, teardownTestDb } = require('./helpers/testDb');

let app;
let customerToken;
let adminToken;

beforeAll(async () => {
  await setupTestDb();
  app = require('../server');

  // Đăng nhập admin seed sẵn
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin123' });
  adminToken = adminLogin.body.token;

  // Đăng ký và đăng nhập user customer
  const customerUser = {
    name: 'Customer Test',
    email: 'customer.booking@test.com',
    password: 'CustomerPass123',
  };
  await request(app).post('/api/auth/register').send(customerUser);
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: customerUser.email, password: customerUser.password });
  customerToken = loginRes.body.token;
});

afterAll(async () => {
  await teardownTestDb();
});

// ─────────────────────────────────────────────────────────────
// GET /api/bookings
// ─────────────────────────────────────────────────────────────
describe('GET /api/bookings', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  it('nên trả về danh sách đặt phòng khi có token hợp lệ', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bookings');
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body).toHaveProperty('total');
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/bookings
// ─────────────────────────────────────────────────────────────
describe('POST /api/bookings', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app).post('/api/bookings').send({});
    expect(res.status).toBe(401);
  });

  it('nên trả về 422 khi body rỗng', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({});
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('nên trả về 422 khi thiếu room_id', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ check_in_date: '2025-12-10', check_out_date: '2025-12-15' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'room_id')).toBe(true);
  });

  it('nên trả về 422 khi thiếu check_in_date', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ room_id: 1, check_out_date: '2025-12-15' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'check_in_date')).toBe(true);
  });

  it('nên trả về 422 khi thiếu check_out_date', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ room_id: 1, check_in_date: '2025-12-10' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'check_out_date')).toBe(true);
  });

  it('nên trả về 422 khi ngày check-out trước check-in', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        room_id: 1,
        check_in_date: '2025-12-15',
        check_out_date: '2025-12-10',
      });
    expect(res.status).toBe(422);
  });

  it('nên trả về 422 khi định dạng ngày không hợp lệ', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        room_id: 1,
        check_in_date: 'ngay-khong-hop-le',
        check_out_date: '2025-12-15',
      });
    expect(res.status).toBe(422);
  });

  it('nên trả về 422 khi trạng thái không hợp lệ', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        room_id: 1,
        check_in_date: '2025-12-10',
        check_out_date: '2025-12-15',
        status: 'trang-thai-khong-ton-tai',
      });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'status')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/bookings/:id
// ─────────────────────────────────────────────────────────────
describe('GET /api/bookings/:id', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app).get('/api/bookings/1');
    expect(res.status).toBe(401);
  });

  it('nên trả về 404 khi booking không tồn tại', async () => {
    const res = await request(app)
      .get('/api/bookings/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('nên trả về 404 khi ID không phải số hợp lệ', async () => {
    const res = await request(app)
      .get('/api/bookings/id-khong-hop-le')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────
// PUT /api/bookings/:id (yêu cầu admin/staff)
// ─────────────────────────────────────────────────────────────
describe('PUT /api/bookings/:id', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .send({ status: 'confirmed' });
    expect(res.status).toBe(401);
  });

  it('nên trả về 403 khi customer cố cập nhật booking', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(403);
  });

  it('nên trả về 422 khi trạng thái không hợp lệ', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'trang-thai-sai' });
    expect(res.status).toBe(422);
    expect(res.body.errors.some((e) => e.field === 'status')).toBe(true);
  });

  it('nên trả về 422 khi total_price âm', async () => {
    const res = await request(app)
      .put('/api/bookings/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ total_price: -5000000 });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/bookings/:id (yêu cầu admin/staff)
// ─────────────────────────────────────────────────────────────
describe('DELETE /api/bookings/:id', () => {
  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app).delete('/api/bookings/1');
    expect(res.status).toBe(401);
  });

  it('nên trả về 403 khi user không đủ quyền (customer)', async () => {
    const res = await request(app)
      .delete('/api/bookings/1')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('nên trả về 204 khi xóa booking (kể cả ID không tồn tại — controller không check)', async () => {
    const res = await request(app)
      .delete('/api/bookings/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    // deleteBooking controller không check exists trước khi xóa → luôn 204
    expect(res.status).toBe(204);
  });
});
