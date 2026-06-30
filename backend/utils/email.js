const { Resend } = require('resend');

// Initialize with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - Optional HTML body (will be used if provided)
 * @returns {Promise}
 */
exports.sendEmail = async (to, subject, text, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Projex <onboarding@resend.dev>',
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw error;
    }

    console.log('✅ Email sent via Resend:', data);
    return data;
  } catch (error) {
    console.error('❌ Resend send error:', error);
    throw error;
  }
};