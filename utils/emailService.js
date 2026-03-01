import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection (optional but recommended)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email server error:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

/**
 * Send Email Function
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"AI Real Estate" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("📧 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};

/**
 * Send Follow-up Email Template
 * @param {string} to
 * @param {string} name
 * @param {string} propertyTitle
 */
export const sendFollowUpEmail = async (to, name, propertyTitle) => {
  const subject = `Follow-up on ${propertyTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Hello ${name},</h2>
      <p>We just wanted to follow up regarding the property:</p>
      <h3>${propertyTitle}</h3>
      <p>Let us know if you'd like to schedule a visit or need more details.</p>
      <br/>
      <p>Best Regards,</p>
      <p><strong>AI Real Estate Team</strong></p>
    </div>
  `;

  return await sendEmail(to, subject, html);
};