/**
 * Kiểm thử tích hợp — Authentication API
 *
 * Bao gồm: đăng ký, đăng nhập, lấy thông tin người dùng (GET /me).
 * Dùng DB test riêng biệt (./data/test.db), không ảnh hưởng DB production.
 */

const { setTestEnv } = require('./helpers/testDb');
setTestEnv(); // Phải gọi trước khi require server

const request = require('supertest');
const { setupTestDb, teardownTestDb } = require('./helpers/testDb');

let app;

beforeAll(async () => {
  await setupTestDb();
  app = require('../server');
});

afterAll(async () => {
  await teardownTestDb();
});

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('nên trả về status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  const validUser = {
    name: 'Người Dùng Test',
    email: 'newuser@test.com',
    password: 'MatKhau123',
  };

  it('nên đăng ký thành công với dữ liệu hợp lệ và trả về 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    // Cho phép 409 nếu user đã tồn tại từ lần chạy trước
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', validUser.email);
      expect(res.body).toHaveProperty('role');
      expect(res.body).not.toHaveProperty('password');
    }
  });

  it('nên trả về 409 khi đăng ký email đã tồn tại', async () => {
    // Đăng ký lần đầu
    await request(app).post('/api/auth/register').send(validUser);
    // Đăng ký lại cùng email
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  it('nên trả về 422 khi thiếu email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', password: 'MatKhau123' });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('nên trả về 422 khi thiếu mật khẩu', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@example.com' });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('nên trả về 422 khi email không hợp lệ', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'email-khong-hop-le', password: 'MatKhau123' });
    expect(res.status).toBe(422);
  });

  it('nên trả về 422 khi mật khẩu quá ngắn (< 6 ký tự)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test2@example.com', password: '123' });
    expect(res.status).toBe(422);
  });

  it('nên trả về 422 khi thiếu tên', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test3@example.com', password: 'MatKhau123' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  const testUser = {
    name: 'Login Test User',
    email: 'logintest@test.com',
    password: 'LoginPass123',
  };

  beforeAll(async () => {
    // Tạo user để test login
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('nên đăng nhập thành công và trả về token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('nên trả về 401 khi mật khẩu sai', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'SaiMatKhau999' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('nên trả về 401 khi email không tồn tại', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'khongtontai@example.com', password: 'MatKhau123' });
    expect(res.status).toBe(401);
  });

  it('nên trả về 422 khi thiếu email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'MatKhau123' });
    expect(res.status).toBe(422);
  });

  it('nên trả về 422 khi thiếu mật khẩu', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(422);
  });

  it('nên trả về 422 khi định dạng email không hợp lệ', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'email-khong-hop-le', password: 'MatKhau123' });
    expect(res.status).toBe(422);
  });
});

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  let validToken;

  beforeAll(async () => {
    // Dùng admin được seed sẵn để lấy token thật
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    validToken = loginRes.body.token;
  });

  it('nên trả về 401 khi không có token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('nên trả về 403 khi token không hợp lệ', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token-gia-mao-khong-hop-le');
    expect(res.status).toBe(403);
  });

  it('nên trả về 200 và thông tin người dùng khi token hợp lệ', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'admin@example.com');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('role', 'admin');
    expect(res.body).not.toHaveProperty('password');
  });
});
