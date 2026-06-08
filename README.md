# Aurora Resort Quy Nhơn — Hotel Management System

## Mô tả dự án

Xây dựng một website quản lý khách sạn cho phép quản lý phòng, khách hàng, đặt phòng, check-in, check-out, thanh toán và quản lý dịch vụ. Hệ thống gồm:

- Frontend: React (Vite)
- Backend: Node.js + Express
- Cơ sở dữ liệu: SQLite

## Kiến trúc hệ thống

React (Frontend)
      │
      │ Axios API
      ▼
Node.js + Express (Backend)
      │
      ▼
SQLite Database

## Cấu trúc thư mục

### Backend
```
backend
│
├── controllers
│   ├── authController.js
│   ├── roomController.js
│   ├── bookingController.js
│   ├── customerController.js
│   └── serviceController.js
│
├── routes
│   ├── authRoutes.js
│   ├── roomRoutes.js
│   ├── bookingRoutes.js
│   ├── customerRoutes.js
│   └── serviceRoutes.js
│
├── models
│   ├── userModel.js
│   ├── roomModel.js
│   ├── bookingModel.js
│   ├── customerModel.js
│   └── serviceModel.js
│
├── middleware
│   └── authMiddleware.js
│
├── database
│   └── db.js
│
├── config
│   └── config.js
│
└── server.js
```

### Frontend
```
frontend
│
├── public
│   └── index.html
│
├── src
│   ├── components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── RoomCard.jsx
│   │
│   ├── pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Rooms.jsx
│   │   ├── Bookings.jsx
│   │   ├── Customers.jsx
│   │   ├── Services.jsx
│   │   └── Profile.jsx
│   │
│   ├── services
│   │   └── api.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

## Chạy dự án

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend mặc định gọi API tại `http://localhost:5000/api`. Nếu backend chạy ở cổng khác, bạn có thể cập nhật biến `VITE_API_BASE` trong file `.env` của frontend.

### Quên mật khẩu (SMTP)

Thêm vào `backend/.env`:

```
FRONTEND_URL=http://localhost:5173
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Sau `npm install` trong thư mục `backend`, gói `nodemailer` sẽ được cài để gửi email đặt lại mật khẩu.

## Kiểm thử (Testing)

### Backend Testing - Comprehensive Guide

#### 1. Cài đặt Testing Framework

```bash
cd backend
npm install --save-dev jest supertest
```

**Dependencies cài đặt:**
- **jest**: Testing framework chính
- **supertest**: HTTP assertion library để test API endpoints

#### 2. Chạy Tests

```bash
# Chạy tất cả tests
npm test

# Chạy tests ở chế độ watch (tự động rerun khi file thay đổi)
npm run test:watch

# Xem coverage report
npm run test:coverage

# Chạy test file cụ thể
npm test auth.integration.test.js
```

#### 3. Cấu trúc Test Files

```
backend/__tests__/
├── helpers/
│   └── testDb.js              # Test database setup & fixtures
├── auth.integration.test.js    # Auth API tests
├── rooms.integration.test.js   # Rooms API tests
└── bookings.integration.test.js # Bookings API tests
```

#### 4. Loại Tests

**a) Integration Tests (API Endpoint Tests)**
- Test toàn bộ request/response cycle
- Validate HTTP status codes
- Check request body validation
- Kiểm tra error handling

```javascript
describe('POST /api/auth/register', () => {
  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        password: 'TestPassword123!',
        // missing email
      });

    expect([400, 422]).toContain(response.status);
  });

  it('should reject weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123', // too weak
      });

    expect([400, 422]).toContain(response.status);
  });
});
```

**b) Unit Tests (Function/Model Tests)**
- Test business logic
- Validate data transformations
- Mock external dependencies

**c) Database Tests**
- Test database initialization
- Seed test data
- Cleanup after tests

#### 5. Test Coverage - Target Percentages

```
Lines      : 70%+  (70% dòng code được test)
Functions  : 70%+  (70% functions được test)
Branches   : 65%+  (65% branches được test)
Statements : 70%+  (70% statements được test)
```

Xem coverage report:
```bash
npm run test:coverage
# Mở file coverage/index.html để xem chi tiết
```

#### 6. Testing Best Practices for Backend

✅ **Nên làm:**
```javascript
// 1. Test validation
it('should validate email format', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ email: 'invalid-email' });
  expect([400, 422]).toContain(response.status);
});

// 2. Test all HTTP methods (GET, POST, PUT, DELETE)
it('should support all CRUD operations', async () => {
  // Create
  const createRes = await request(app)
    .post('/api/rooms')
    .send({ room_number: '101', price: 1000000 });
  
  // Read
  const getRes = await request(app).get(`/api/rooms/${createRes.body.id}`);
  
  // Update
  const updateRes = await request(app)
    .put(`/api/rooms/${createRes.body.id}`)
    .send({ status: 'maintenance' });
  
  // Delete
  const deleteRes = await request(app).delete(`/api/rooms/${createRes.body.id}`);
});

// 3. Test error responses
it('should return proper error messages', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'nonexistent@test.com', password: 'wrong' });
  
  expect(response.status).toBe(401);
  expect(response.body).toHaveProperty('message');
});

// 4. Test authentication
it('should require authentication token', async () => {
  const response = await request(app).get('/api/auth/me');
  expect(response.status).toBe(401);
});
```

❌ **Không nên làm:**
```javascript
// 1. Không test implementation details
it('should call userModel.findByEmail once', async () => {
  // BAD: testing internal calls
  expect(userModelMock.findByEmail).toHaveBeenCalledTimes(1);
});

// 2. Không skip tests
it.skip('should do something', () => {
  // BAD: tests không được chạy
});

// 3. Không hardcode wait times
it('should process request', async () => {
  await request(app).get('/api/rooms');
  await new Promise(resolve => setTimeout(resolve, 1000)); // BAD
});
```

---

### Frontend Testing - Comprehensive Guide

#### 1. Cài đặt Testing Framework

```bash
cd frontend
npm install --save-dev vitest @vitest/ui @testing-library/react jsdom
```

**Dependencies cài đặt:**
- **vitest**: Fast unit test framework (tương tự Jest nhưng nhanh hơn)
- **@testing-library/react**: React component testing utilities
- **jsdom**: DOM implementation cho test environment
- **@vitest/ui**: Interactive UI for test results

#### 2. Chạy Frontend Tests

```bash
# Chạy tất cả tests
npm test

# Watch mode (auto-rerun)
npm test -- --watch

# Xem coverage
npm run test:coverage

# Mở interactive UI dashboard
npm run test:ui

# Run specific test file
npm test -- auth.component.test.jsx
```

#### 3. Cấu trúc Test Files

```
frontend/src/test/
├── setup.js                    # Test environment setup
├── auth.component.test.jsx     # Component tests
└── utils.test.js               # Utility function tests
```

#### 4. Component Testing Examples

**a) Test Component Rendering**
```javascript
describe('PasswordInput Component', () => {
  it('should render password input', () => {
    const { getByTestId } = render(
      <PasswordInput value="" onChange={vi.fn()} />
    );

    const input = getByTestId('password-input');
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('password');
  });
});
```

**b) Test User Interactions**
```javascript
describe('LoginForm Component', () => {
  it('should call onSubmit when form submitted', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LoginForm onSubmit={handleSubmit} />
      </BrowserRouter>
    );

    await user.type(screen.getByTestId('email-input'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

**c) Test Form Validation**
```javascript
it('should require email input', async () => {
  const user = userEvent.setup();
  render(<LoginForm onSubmit={vi.fn()} />);

  const emailInput = screen.getByTestId('email-input');
  await user.click(screen.getByRole('button'));

  expect(emailInput.value).toBe(''); // still empty = validation failed
});
```

#### 5. Utility Function Testing

```javascript
describe('formatCurrency utility', () => {
  it('should format amount to VND', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
  });

  it('should handle decimal values', () => {
    const result = formatCurrency(1500000.50);
    expect(result).toContain('1.500.000');
  });
});

describe('calculateBookingTotal', () => {
  it('should calculate total price correctly', () => {
    const total = calculateBookingTotal(1000000, 3); // 3 days
    expect(total).toBe(3000000);
  });
});
```

#### 6. Frontend Testing Best Practices

✅ **Nên làm:**
```javascript
// 1. Test user behavior, not implementation
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();

  render(<LoginForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
  await user.click(screen.getByRole('button'));

  expect(onSubmit).toHaveBeenCalled();
});

// 2. Use data-testid for hard-to-find elements
render(<Component />);
expect(screen.getByTestId('password-input')).toBeInTheDocument();

// 3. Test accessibility
it('should have proper ARIA labels', () => {
  render(<Form />);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
});

// 4. Mock API calls
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
```

❌ **Không nên làm:**
```javascript
// 1. Không test state trực tiếp
expect(wrapper.vm.formData).toEqual({...}); // BAD

// 2. Không mock quá nhiều
render(
  <MockedComponent
    MockedChild={MockChild}
    MockedService={mockService}
  />
); // BAD

// 3. Không dùng shallow rendering, test behavior
it('should render button', () => {
  shallow(<Button />); // BAD
});
```

---

### CI/CD Integration

Thêm scripts để chạy tests tự động trên GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm test
      - run: cd frontend && npm install && npm test
```

---

### Troubleshooting Tests

#### Backend Tests Issues

**Error: "Database not initialized"**
```bash
# Solution: Ensure database is initialized in test setup
npm test -- --forceExit
```

**Error: "Port already in use"**
```bash
# Solution: Tests now use forceExit and maxWorkers=1
npm test
```

#### Frontend Tests Issues

**Error: "Cannot find module 'react'"**
```bash
cd frontend
npm install
npm test
```

**Error: "Warning about React Router future flags"**
```javascript
// This is just a warning, not an error. Can be ignored in tests.
```

---

### Test Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Line Coverage | 70%+ | To be checked |
| Function Coverage | 70%+ | To be checked |
| Branch Coverage | 65%+ | To be checked |
| Statement Coverage | 70%+ | To be checked |

Run `npm run test:coverage` to see current coverage.

---

### Running All Tests Together

```bash
# Backend
cd backend
npm install
npm test

# Frontend
cd frontend
npm install
npm test

# Both with one command (run from root)
./run-all-tests.sh
```

Create `run-all-tests.sh`:
```bash
#!/bin/bash
echo "Running backend tests..."
cd backend && npm test && cd ..

echo "Running frontend tests..."
cd frontend && npm test && cd ..

echo "All tests completed!"
```

