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
});

exports.sendEmail = async (to, subject, text, html) => {
  console.log(`📧 Attempting to send email to ${to} with subject "${subject}"`);
  try {
    const info = await transporter.sendMail({
      from: `"Projex" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });
    console.log('✅ Email sent - SMTP response:', info.response);
    console.log('✅ Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send error - full error:', error);
    throw error;
  }
};