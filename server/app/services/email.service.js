const nodemailer = require('nodemailer');
const logger = require('../lib/logger');

/**
 * Configure SMTP service
 * Note: For production, use environment variables for credentials.
 */
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USER || '603f549a03d4b6',
    pass: process.env.MAIL_PASS || 'e5858d04efc982',
  },
});

/**
 * Send greeting email with credentials to new users
 */
exports.sendGreetingEmail = async (email, firstname, username, password, role) => {
  try {
    const info = await transporter.sendMail({
      from: `"IMS Management" <${process.env.MAIL_FROM || 'no-reply@ims.edu'}>`,
      to: email,
      subject: `Welcome to IMS, ${firstname}!`,
      text: `Hello ${firstname},\n\nWelcome to Institute Management System as a ${role}. Your account has been created.\n\nUsername: ${username}\nPassword: ${password}\n\nPlease login and change your password.\n\nBest regards,\nIMS Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #6366f1;">Welcome to IMS, ${firstname}!</h2>
          <p>Your journey with us as a <strong>${role}</strong> starts now. We've created your account with the following credentials:</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Username:</strong> ${username}</p>
            <p style="margin: 10px 0 0 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please log in at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="color: #6366f1; font-weight: bold;">IMS Portal</a> and change your password immediately.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">This is an automated message. Please do not reply.</p>
        </div>
      `,
    });

    logger.info(`Greeting email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${email}: ${error.message}`);
    return false;
  }
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (email, username, newPassword) => {
  try {
    const info = await transporter.sendMail({
      from: `"IMS Management" <${process.env.MAIL_FROM || 'no-reply@ims.edu'}>`,
      to: email,
      subject: `Your IMS Password Has Been Reset`,
      text: `Hello,\n\nYour IMS password has been successfully reset.\n\nUsername: ${username}\nNew Password: ${newPassword}\n\nPlease login and change your password immediately.\n\nBest regards,\nIMS Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #6366f1;">Password Reset</h2>
          <p>Your IMS password has been reset successfully. Here are your new credentials:</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Username:</strong> ${username}</p>
            <p style="margin: 10px 0 0 0;"><strong>New Password:</strong> ${newPassword}</p>
          </div>
          <p>Please log in at <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="color: #6366f1; font-weight: bold;">IMS Portal</a> and change your password immediately.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">This is an automated message. Please do not reply.</p>
        </div>
      `,
    });

    logger.info(`Password reset email sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send reset email to ${email}: ${error.message}`);
    return false;
  }
};
