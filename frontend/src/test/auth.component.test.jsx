/**
 * Kiểm thử thành phần — PasswordInput.jsx (component thật của dự án)
 *
 * Kiểm thử component src/components/auth/PasswordInput.jsx bao gồm:
 * - Hiển thị input dạng password
 * - Nút toggle hiện/ẩn mật khẩu
 * - Thay đổi aria-label theo trạng thái
 * - Hiển thị error styling
 * - Nhận placeholder và giá trị từ props
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from '../components/auth/PasswordInput';

// Mock lucide-react để tránh lỗi khi render trong jsdom
vi.mock('lucide-react', () => ({
  Eye: (props) => <svg data-testid="icon-eye" {...props} />,
  EyeOff: (props) => <svg data-testid="icon-eye-off" {...props} />,
}));

// ─────────────────────────────────────────────────────────────
// Hiển thị cơ bản
// ─────────────────────────────────────────────────────────────
describe('PasswordInput — Hiển thị cơ bản', () => {
  it('nên render input với type="password" mặc định', () => {
    render(
      <PasswordInput
        id="password"
        value=""
        onChange={vi.fn()}
        placeholder="Mật khẩu"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');
  });

  it('nên render nút toggle hiện/ẩn mật khẩu', () => {
    render(
      <PasswordInput
        id="password"
        value=""
        onChange={vi.fn()}
      />
    );

    const toggleBtn = screen.getByRole('button');
    expect(toggleBtn).toBeInTheDocument();
  });

  it('nên hiển thị icon Eye (mắt hở) khi mật khẩu đang ẩn', () => {
    render(
      <PasswordInput
        id="password"
        value="matkhau123"
        onChange={vi.fn()}
      />
    );

    // Mặc định đang ẩn → hiện icon Eye
    expect(screen.getByTestId('icon-eye')).toBeInTheDocument();
  });

  it('nên có aria-label "Hiện mật khẩu" ở trạng thái mặc định (ẩn)', () => {
    render(
      <PasswordInput id="pw" value="" onChange={vi.fn()} />
    );
    const btn = screen.getByRole('button', { name: /hiện mật khẩu/i });
    expect(btn).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// Chức năng toggle hiện/ẩn mật khẩu
// ─────────────────────────────────────────────────────────────
describe('PasswordInput — Toggle hiện/ẩn mật khẩu', () => {
  it('nên chuyển type sang "text" khi nhấn nút toggle', async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput
        id="password"
        value="matkhau123"
        onChange={vi.fn()}
        placeholder="Mật khẩu"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    const toggleBtn = screen.getByRole('button');

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggleBtn);

    expect(input).toHaveAttribute('type', 'text');
  });

  it('nên chuyển lại về type "password" khi nhấn toggle lần hai', async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput
        id="password"
        value="matkhau123"
        onChange={vi.fn()}
        placeholder="Mật khẩu"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    const toggleBtn = screen.getByRole('button');

    await user.click(toggleBtn); // → text
    await user.click(toggleBtn); // → password lại

    expect(input).toHaveAttribute('type', 'password');
  });

  it('nên hiển thị icon EyeOff (mắt nhắm) sau khi toggle', async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput id="pw" value="abc" onChange={vi.fn()} />
    );

    const toggleBtn = screen.getByRole('button');
    await user.click(toggleBtn);

    expect(screen.getByTestId('icon-eye-off')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-eye')).not.toBeInTheDocument();
  });

  it('nên cập nhật aria-label thành "Ẩn mật khẩu" sau khi toggle', async () => {
    const user = userEvent.setup();

    render(
      <PasswordInput id="pw" value="abc" onChange={vi.fn()} />
    );

    const toggleBtn = screen.getByRole('button', { name: /hiện mật khẩu/i });
    await user.click(toggleBtn);

    expect(screen.getByRole('button', { name: /ẩn mật khẩu/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────
// Props và callback
// ─────────────────────────────────────────────────────────────
describe('PasswordInput — Props và callbacks', () => {
  it('nên gọi onChange khi người dùng gõ vào input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PasswordInput
        id="password"
        value=""
        onChange={handleChange}
        placeholder="Mật khẩu"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    await user.type(input, 'a');

    expect(handleChange).toHaveBeenCalled();
  });

  it('nên hiển thị đúng giá trị từ prop value', () => {
    render(
      <PasswordInput
        id="pw"
        value="MySecret123"
        onChange={vi.fn()}
        placeholder="Mật khẩu"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    expect(input.value).toBe('MySecret123');
  });

  it('nên dùng placeholder mặc định "Mật khẩu" khi không truyền prop', () => {
    render(
      <PasswordInput id="pw" value="" onChange={vi.fn()} />
    );
    expect(screen.getByPlaceholderText('Mật khẩu')).toBeInTheDocument();
  });

  it('nên truyền id xuống input element', () => {
    render(
      <PasswordInput
        id="my-password-input"
        value=""
        onChange={vi.fn()}
        placeholder="Mật khẩu"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    expect(input).toHaveAttribute('id', 'my-password-input');
  });
});

// ─────────────────────────────────────────────────────────────
// Error state
// ─────────────────────────────────────────────────────────────
describe('PasswordInput — Hiển thị lỗi', () => {
  it('nên áp dụng class lỗi khi prop error được truyền', () => {
    render(
      <PasswordInput
        id="pw"
        value=""
        onChange={vi.fn()}
        placeholder="Mật khẩu"
        error="Mật khẩu không hợp lệ"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    // Khi có error, class chứa border-rose-400
    expect(input.className).toContain('border-rose-400');
  });

  it('nên không có class lỗi khi không truyền prop error', () => {
    render(
      <PasswordInput
        id="pw"
        value=""
        onChange={vi.fn()}
        placeholder="Mật khẩu"
      />
    );

    const input = screen.getByPlaceholderText('Mật khẩu');
    expect(input.className).not.toContain('border-rose-400');
  });
});
