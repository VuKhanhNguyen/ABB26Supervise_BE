import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a password reset PIN to the user's email
 * @param email Recipient email
 * @param pin 6-digit PIN code
 */
export const sendResetPinEmail = async (email: string, pin: string): Promise<void> => {
  const mailOptions = {
    from: `"AB26 Supervise" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'AB26 RECOVERY: Authorization PIN',
    html: `
      <div style="background-color: #0b0b0b; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 10px; border: 1px solid #1e4d6b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #98cdf2; letter-spacing: 5px; text-transform: uppercase;">AB26 SUPERVISE</h1>
          <p style="color: #6a767e; font-size: 10px; letter-spacing: 2px;">KINETIC INTELLIGENCE SYSTEM v2.0</p>
        </div>
        
        <div style="background-color: #131313; padding: 20px; border-radius: 8px; border-left: 4px solid #98cdf2;">
          <h2 style="font-size: 16px; margin-top: 0; color: #98cdf2;">AUTHORIZATION PROTOCOL INITIATED</h2>
          <p style="font-size: 14px; line-height: 1.6;">
            A password recovery process has been requested for this Operator ID. Use the sensitive authorization code below to reset your encryption keys:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #98cdf2; color: #00344c; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 4px; letter-spacing: 10px;">
              ${pin}
            </div>
          </div>
          
          <p style="font-size: 12px; color: #6a767e;">
            This synchronization code will expire in 1 hour. If you did not initiate this protocol, please secure your credentials immediately.
          </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #6a767e; font-size: 10px; letter-spacing: 1px;">
          <p>SYSTEM_STABLE / LATENCY: 12MS / CORE_2026_A</p>
          <p>&copy; 2026 AB26 INTELLIGENCE NETWORK</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Reset PIN sent successfully to ${email}`);
  } catch (error) {
    console.error('[EMAIL] Failed to send email:', error);
    throw new Error('Failed to send authorization PIN to the recipient address.');
  }
};
