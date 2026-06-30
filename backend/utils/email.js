const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = async (to, subject, text, html) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    };
    const response = await sgMail.send(msg);
    console.log('✅ Email sent via SendGrid');
    return response;
  } catch (error) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    throw error;
  }
};
