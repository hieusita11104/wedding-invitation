
exports.otpTemplate = (user, otp) => {
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mã OTP Xác Thực</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 28px; font-weight: 600; margin-bottom: 10px; }
          .header p { color: #e2e8f0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #2d3748; margin-bottom: 20px; }
          .otp-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                         border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0; 
                         box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); }
          .otp-label { color: #ffffff; font-size: 16px; margin-bottom: 15px; font-weight: 500; }
          .otp-code { background-color: #ffffff; color: #667eea; font-size: 36px; font-weight: 700; 
                     padding: 20px 30px; border-radius: 10px; letter-spacing: 8px; 
                     display: inline-block; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .otp-timer { color: #e2e8f0; font-size: 14px; margin-top: 15px; }
          .instructions { background-color: #f7fafc; border-left: 4px solid #667eea; 
                        padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
          .instructions h3 { color: #2d3748; font-size: 16px; margin-bottom: 10px; }
          .instructions ul { color: #4a5568; font-size: 14px; line-height: 1.6; }
          .instructions li { margin-bottom: 5px; }
          .warning { background-color: #fed7d7; border: 1px solid #feb2b2; color: #c53030; 
                    padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
          .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }
          .footer h4 { color: #ffffff; margin-bottom: 10px; }
          .footer p { font-size: 14px; line-height: 1.5; }
          .contact-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #4a5568; }
          @media (max-width: 600px) {
              .container { margin: 0; }
              .content { padding: 20px; }
              .otp-code { font-size: 28px; padding: 15px 20px; letter-spacing: 4px; }
              .header h1 { font-size: 24px; }
              .header { padding: 30px 20px; }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <!-- Header -->
          <div class="header">
              <h1>🎉 Wedding Invitation</h1>
              <p>Hệ thống thiệp cưới trực tuyến</p>
          </div>

          <!-- Content -->
          <div class="content">
              <div class="greeting">
                  Xin chào <strong>${user.name || 'Quý khách'}</strong>,
              </div>

              <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                  Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                  Vui lòng sử dụng mã OTP bên dưới để tiếp tục:
              </p>

              <!-- OTP Container -->
              <div class="otp-container">
                  <div class="otp-label">MÃ OTP CỦA BẠN</div>
                  <div class="otp-code">${otp}</div>
                  <div class="otp-timer">⏰ Mã này có hiệu lực trong <strong>60 giây</strong></div>
              </div>

              <!-- Instructions -->
              <div class="instructions">
                  <h3>📋 Hướng dẫn sử dụng:</h3>
                  <ul>
                      <li>Sao chép mã OTP ở trên</li>
                      <li>Quay lại trang web và dán mã vào ô xác thực</li>
                      <li>Nhấn "Xác nhận" để tiếp tục đặt lại mật khẩu</li>
                      <li>Tạo mật khẩu mới an toàn cho tài khoản</li>
                  </ul>
              </div>

              <!-- Warning -->
              <div class="warning">
                  <strong>⚠️ Lưu ý quan trọng:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, 
                  vui lòng bỏ qua email này và kiểm tra bảo mật tài khoản.
              </div>

              <p style="color: #4a5568; font-size: 14px; margin-top: 30px;">
                  Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! 💕
              </p>
          </div>

          <!-- Footer -->
          <div class="footer">
              <h4>Wedding Invitation System</h4>
              <p>Tạo thiệp cưới đẹp và độc đáo cho ngày trọng đại của bạn</p>
              
              <div class="contact-info">
                  <p>📧 Email hỗ trợ: support@weddinginvitation.com</p>
                  <p>📞 Hotline: 1900-123-456</p>
                  <p>🌐 Website: www.weddinginvitation.com</p>
              </div>
          </div>
      </div>
  </body>
  </html>
  `;
};

// Template cho email chào mừng user mới
exports.welcomeTemplate = (user) => {
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng đến với Wedding Invitation</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: #ffffff; font-size: 28px; font-weight: 600; margin-bottom: 10px; }
          .header p { color: #e2e8f0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #2d3748; margin-bottom: 20px; }
          .welcome-box { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); 
                        border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0; }
          .welcome-title { color: #2d3748; font-size: 24px; font-weight: 600; margin-bottom: 15px; }
          .footer { background-color: #2d3748; color: #a0aec0; padding: 30px; text-align: center; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>🎉 Wedding Invitation</h1>
              <p>Hệ thống thiệp cưới trực tuyến</p>
          </div>
          <div class="content">
              <div class="greeting">
                  Xin chào <strong>${user.name}</strong>,
              </div>
              <div class="welcome-box">
                  <div class="welcome-title">Chào mừng bạn! 🎊</div>
                  <p>Tài khoản của bạn đã được tạo thành công!</p>
              </div>
          </div>
          <div class="footer">
              <h4>Wedding Invitation System</h4>
              <p>Tạo thiệp cưới đẹp và độc đáo cho ngày trọng đại của bạn</p>
          </div>
      </div>
  </body>
  </html>
  `;
}; 