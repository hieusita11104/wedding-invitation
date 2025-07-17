const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendOTPEmail } = require("../services/email/emailService");

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    console.log("Login attempt:", { emailOrPhone });

    if (!emailOrPhone || !password) {
      console.log("Missing email/phone or password");
      return res.status(400).json({
        message: "Vui lòng nhập email/số điện thoại và mật khẩu",
      });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        message: "Tài khoản không tồn tại",
        field: "emailOrPhone"
      });
    }

    // Validate password format
    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
        field: "password"
      });
    }

    console.log("Password:", password);
    console.log("User password:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch ? "Yes" : "No");

    if (!isMatch) {
      console.log("Password does not match");
      return res.status(401).json({
        message: "Mật khẩu không đúng",
        field: "password"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("Token generated successfully");

    // Set cookie with proper configuration for cross-origin
    const cookieOptions = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };
    
    res.cookie("token", token, cookieOptions);
    console.log("Cookie set with options:", cookieOptions);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Lỗi khi đăng nhập",
      error: error.message,
    });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  try {
    // Xóa cookie token
    res.clearCookie("token");
    
    // Xóa session passport
    if (req.session) {
      req.session.destroy();
    }
    
    // Xóa user từ request
    req.logout(function(err) {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          message: "Lỗi khi đăng xuất",
          error: err.message,
        });
      }
      res.status(200).json({
        message: "Đăng xuất thành công",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Lỗi khi đăng xuất",
      error: error.message,
    });
  }
};

const MAX_ATTEMPTS = 3;
const LOCK_TIME = 60 * 1000; // 60 seconds in milliseconds

// Xác minh OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Vui lòng nhập email và OTP" });
    }

    const user = await User.findOne({ email }).select("+otp +otpExpires +otpAttempts +otpLockUntil");
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    // Kiểm tra xem user có đang bị khóa không
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const timeLeft = Math.ceil((user.otpLockUntil - Date.now()) / 1000);
      return res.status(429).json({ 
        message: `Vui lòng đợi ${timeLeft} giây trước khi thử lại`,
        lockTimeLeft: timeLeft
      });
    }

    // Reset attempts nếu đã hết thời gian khóa
    if (user.otpLockUntil && user.otpLockUntil <= Date.now()) {
      user.otpAttempts = 0;
      user.otpLockUntil = null;
    }

    // Kiểm tra OTP
    if (user.otp !== otp) {
      // Tăng số lần thử
      user.otpAttempts += 1;

      // Kiểm tra và khóa nếu vượt quá số lần thử
      if (user.otpAttempts >= MAX_ATTEMPTS) {
        user.otpLockUntil = new Date(Date.now() + LOCK_TIME);
        await user.save();
        return res.status(429).json({
          message: `Bạn đã nhập sai quá ${MAX_ATTEMPTS} lần. Vui lòng đợi ${LOCK_TIME/1000} giây trước khi thử lại`,
          lockTimeLeft: LOCK_TIME/1000
        });
      }

      await user.save();
      return res.status(400).json({ 
        message: "Mã OTP không đúng",
        attemptsLeft: MAX_ATTEMPTS - user.otpAttempts
      });
    }

    // Kiểm tra OTP hết hạn
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ 
        message: "Mã OTP đã hết hạn",
        expired: true
      });
    }

    // OTP hợp lệ, reset attempts và xóa OTP
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    user.otpLockUntil = null;
    await user.save();

    res.status(200).json({ message: "Xác minh OTP thành công" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Lỗi khi xác minh OTP", error: error.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Lỗi khi đặt lại mật khẩu", error: error.message });
  }
};

// Gửi OTP để quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    const user = await User.findOne({ email }).select("+otpAttempts +otpLockUntil");
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại" });
    }

    // Kiểm tra xem user có đang bị khóa không
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
      const timeLeft = Math.ceil((user.otpLockUntil - Date.now()) / 1000);
      return res.status(429).json({ 
        message: `Vui lòng đợi ${timeLeft} giây trước khi thử lại`,
        lockTimeLeft: timeLeft
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0; // Reset attempts khi gửi OTP mới
    user.otpLockUntil = null;
    await user.save();

    // Kiểm tra biến môi trường email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Email credentials not configured");
      return res.status(500).json({ 
        message: "Lỗi cấu hình email. Vui lòng liên hệ admin." 
      });
    }

    try {
      // Sử dụng email service để gửi OTP
      const emailResult = await sendOTPEmail(user, otp);
      console.log("✅ Email sent successfully:", emailResult);
      
      res.status(200).json({ 
        message: "Mã OTP đã được gửi đến email của bạn",
        debug: process.env.NODE_ENV === 'development' ? { otp } : undefined
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      
      // Log chi tiết để debug
      console.error("Email error details:", {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command
      });

      // Xóa OTP đã lưu vì không gửi được email
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      return res.status(500).json({ 
        message: "Không thể gửi email. Vui lòng thử lại sau.",
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      message: "Lỗi khi xử lý yêu cầu", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};