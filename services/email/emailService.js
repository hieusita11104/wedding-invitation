const nodemailer = require("nodemailer");
const { otpTemplate, welcomeTemplate } = require("./emailTemplates");

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test kết nối email khi khởi động
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service connected successfully");
  } catch (error) {
    console.error("❌ Email service connection failed:", error.message);
    console.error("Please check your EMAIL_USER and EMAIL_PASS environment variables");
  }
};

// Gọi test khi module được load
testEmailConnection();

// Gửi email OTP
exports.sendOTPEmail = async (user, otp) => {
  try {
    console.log("Sending OTP email to:", user.email);
    console.log("User data:", { name: user.name, email: user.email });
    console.log("OTP:", otp);

    const htmlContent = otpTemplate(user, otp);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "🔐 Mã OTP Xác Thực - Wedding Invitation System",
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 60 giây.`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully to:", user.email);
    console.log("Message ID:", result.messageId);
    return { success: true, message: "Email sent successfully", messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

// Gửi email chào mừng
exports.sendWelcomeEmail = async (user) => {
  try {
    console.log("Sending welcome email to:", user.email);
    
    const htmlContent = welcomeTemplate(user);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "🎉 Chào mừng bạn đến với Wedding Invitation System",
      text: `Chào mừng ${user.name} đến với Wedding Invitation System!`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent successfully to:", user.email);
    console.log("Message ID:", result.messageId);
    return { success: true, message: "Welcome email sent successfully", messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};

// Gửi email tùy chỉnh
exports.sendCustomEmail = async (to, subject, textContent, htmlContent) => {
  try {
    console.log("Sending custom email to:", to);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Custom email sent successfully to:", to);
    console.log("Message ID:", result.messageId);
    return { success: true, message: "Custom email sent successfully", messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending custom email:", error);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error(`Failed to send custom email: ${error.message}`);
  }
}; 