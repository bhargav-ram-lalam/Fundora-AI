const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`[DEV] Password reset URL for ${email}: ${resetUrl}`);
    return true;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Fundora AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Fundora AI - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Fundora AI</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">From Idea to Investment with AI</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1e293b;">Hello ${name},</h2>
          <p style="color: #64748b;">You requested a password reset for your FundAI account. Click the button below to reset your password. This link expires in 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">If you didn't request this, please ignore this email. Your password won't change.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2024 FundAI Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
};

module.exports = { sendPasswordResetEmail };
