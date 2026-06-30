const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4, // force IPv4
});

exports.sendEmail = async (to, subject, text, html) => {
  // Build a clean HTML email with a button
  const defaultHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #4F46E5;">Projex</h2>
      <p style="font-size: 16px; color: #333;">${text}</p>
      ${html ? `<div style="margin-top: 20px;">${html}</div>` : ''}
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Projex Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text, // plain text fallback
      html: html || defaultHtml,
    });
    console.log('✅ Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw error;
  }
};
