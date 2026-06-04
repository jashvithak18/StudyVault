import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

/**
 * Sends a password reset email using nodemailer.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body content
 */
export const sendEmail = async (to, subject, html) => {
  // If email config is not present, fall back to logging in console
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[MAIL WARNING] SMTP environment variables (EMAIL_USER/EMAIL_PASS) are missing. Fallback: Logging code in console.");
    return false;
  }

  // Create transporter configuration
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password if using Gmail
    },
  });

  const mailOptions = {
    from: `"StudyVault Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[MAIL SUCCESS] Verification email sent to: ${to}`);
    return true;
  } catch (error) {
    console.error(`[MAIL ERROR] Failed to send email to ${to}:`, error);
    throw new Error('Email delivery failed: ' + error.message);
  }
};

export default sendEmail;
