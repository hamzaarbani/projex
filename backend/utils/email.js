const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,           // ✅ secure port
  secure: true,        // ✅ true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  family: 4,           // ✅ force IPv4
});

exports.sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Projex Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    console.log('✅ Email sent via Gmail:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Gmail send error:', error);
    throw error;
  }
};
