const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter configuration: prefer environment-configured SMTP/app-password
let emailTransporter;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Generic SMTP configuration
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
      secure: process.env.SMTP_SECURE ? (process.env.SMTP_SECURE === 'true') : true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('✅ Email transporter configured using SMTP_HOST');
  } else if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Service-based (e.g., 'gmail') configuration
    emailTransporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('✅ Email transporter configured using SMTP_SERVICE');
  } else {
    // Fallback for development (previously hardcoded credentials were here)
    console.warn('⚠️  SMTP credentials not found in environment. Using development fallback (emails will not be delivered).');
    emailTransporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }
} catch (err) {
  console.error('❌ Failed to configure email transporter:', err.message);
  emailTransporter = nodemailer.createTransport({ jsonTransport: true });
}

// Store verification codes in memory (in production, use database)
const verificationCodes = new Map();

// Generate random 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, code) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@apkl.test',
      to: email,
      subject: 'APKL Registration Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Thank you for registering with APKL. Please use the following verification code to complete your registration:
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
              <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            </div>
            <p style="color: #999; font-size: 14px;">
              This code will expire in 10 minutes. Do not share this code with anyone.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return result;
  } catch (error) {
    console.warn('⚠️  Email sending failed:', error.message);
    console.log('📌 DEVELOPMENT MODE: Verification code for', email, ':', code);
    console.log('📌 Use this code to complete registration (code valid for 10 minutes)');
    
    // In development mode, still consider it a success so user can use the code
    return { 
      success: true, 
      message: 'Code generated (email service unavailable - using development mode)',
      code: code 
    };
  }
}

// Store verification code
function storeVerificationCode(email, code) {
  // Store with 10-minute expiration
  const expiresAt = Date.now() + (10 * 60 * 1000);
  verificationCodes.set(email, { code, expiresAt });
}

// Verify code
function verifyCode(email, code) {
  const storedData = verificationCodes.get(email);
  
  if (!storedData) {
    return { valid: false, message: 'No verification code found for this email' };
  }

  if (Date.now() > storedData.expiresAt) {
    verificationCodes.delete(email);
    return { valid: false, message: 'Verification code has expired' };
  }

  if (storedData.code !== code) {
    return { valid: false, message: 'Invalid verification code' };
  }

  // Code is valid, remove it
  verificationCodes.delete(email);
  return { valid: true, message: 'Code verified successfully' };
}

// Send class notification email
async function sendClassNotificationEmail(studentEmail, classDetails) {
  try {
    const { courseName, courseCode, startDate, startTime, endTime, topic, meetingId, location } = classDetails;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@apkl.test',
      to: studentEmail,
      subject: `📚 Class Scheduled: ${courseName} (${courseCode})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc; margin-bottom: 20px;">📚 Class Scheduled</h2>
            
            <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #0066cc;">
              <p style="color: #333; margin: 10px 0; font-size: 16px;"><strong>Course:</strong> ${courseName} (${courseCode})</p>
              <p style="color: #333; margin: 10px 0; font-size: 16px;"><strong>Topic:</strong> ${topic}</p>
              <p style="color: #333; margin: 10px 0; font-size: 16px;"><strong>Date:</strong> ${startDate}</p>
              <p style="color: #333; margin: 10px 0; font-size: 16px;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
              <p style="color: #333; margin: 10px 0; font-size: 16px;"><strong>Location:</strong> ${location}</p>
            </div>

            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ff9f00;">
              <p style="color: #333; margin: 0; font-size: 14px;"><strong>✨ Meeting ID:</strong></p>
              <p style="background-color: #f0f0f0; padding: 12px; border-radius: 4px; margin: 10px 0; font-size: 18px; color: #0066cc; font-weight: bold; text-align: center;">${meetingId}</p>
            </div>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #00c896;">
              <p style="color: #333; margin: 0; font-size: 16px;"><strong>✅ How to Join:</strong></p>
              <ol style="color: #666; font-size: 14px; margin: 15px 0; padding-left: 20px;">
                <li>Go to APKL Student Dashboard</li>
                <li>Navigate to "Class Activities"</li>
                <li>Find this class and click "Start"</li>
                <li>You will be able to join at the scheduled time</li>
              </ol>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              See you in class! If you have any questions, please contact your instructor.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
              This is an automated message from APKL Learning Management System. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Class notification email sent to:', studentEmail);
    return result;
  } catch (error) {
    console.error('❌ Error sending class notification email:', error.message);
    throw error;
  }
}

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  storeVerificationCode,
  verifyCode,
  sendClassNotificationEmail,
  emailTransporter
};
