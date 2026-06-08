const nodemailer = require('nodemailer');
const config = require('../config/config');

let transporter = null;

function getTransporter() {
  const { host, port, user, pass } = config.smtp;
  if (!host || !user || !pass) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(`[email] SMTP chưa cấu hình — bỏ qua gửi tới ${to}`);
    return { skipped: true };
  }

  const info = await transport.sendMail({
    from: config.smtp.from,
    to,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = { sendEmail };
