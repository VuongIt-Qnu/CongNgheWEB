function forgotPasswordEmail(token, frontendUrl) {
  const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password/${token}`;
  const subject = 'Đặt lại mật khẩu tài khoản Aurora Resort';
  const text = `Xin chào,

Chúng tôi nhận được yêu cầu đặt lại mật khẩu.

Nhấn vào liên kết bên dưới:
${resetUrl}

Liên kết có hiệu lực trong 15 phút.

Nếu bạn không yêu cầu, vui lòng bỏ qua email này.`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
      <p>Xin chào,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu.</p>
      <p>Nhấn vào liên kết bên dưới:</p>
      <p><a href="${resetUrl}" style="color: #b45309; font-weight: bold;">Đặt lại mật khẩu</a></p>
      <p style="word-break: break-all; font-size: 13px; color: #64748b;">${resetUrl}</p>
      <p>Liên kết có hiệu lực trong <strong>15 phút</strong>.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    </div>
  `;

  return { subject, text, html };
}

module.exports = { forgotPasswordEmail };
