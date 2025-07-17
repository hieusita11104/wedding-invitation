const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Tên không được để trống'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email không được để trống'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Vui lòng nhập địa chỉ email hợp lệ']
  },
  role: { 
    type: String, 
    enum: ["admin", "user"], 
    default: "user" 
  },
  gender: { 
    type: String, 
    enum: ["male", "female", "other"], 
    default: "other" 
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  phone: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Nếu là Google user, cho phép bất kỳ giá trị nào (kể cả phone fake)
        if (this.isGoogleUser) {
          return true;
        }
        // Nếu không phải Google user, phone phải có giá trị và đúng định dạng
        return v && /^[0-9]{10,11}$/.test(v);
      },
      message: props => {
        if (!props.value) {
          return 'Số điện thoại không được để trống với tài khoản thông thường';
        }
        return 'Số điện thoại phải có 10 hoặc 11 số';
      }
    }
  },
  password: { 
    type: String,
    validate: {
      validator: function(v) {
        // Bỏ qua validation cho Google users
        if (this.isGoogleUser) {
          return true;
        }
        // Validate password cho non-Google users
        if (!v) return false;
        const hasUpperCase = /[A-Z]/.test(v);
        const hasLowerCase = /[a-z]/.test(v);
        const hasNumber = /\d/.test(v);
        const hasSpecialChar = /[!@#$%^&*]/.test(v);
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      },
      message: 'Mật khẩu phải chứa ít nhất 1 chữ in hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (!@#$%^&*)'
    }
  },
  address: { 
    type: String,
    validate: {
      validator: function(v) {
        return this.isGoogleUser ? true : Boolean(v);
      },
      message: 'Địa chỉ không được để trống với tài khoản thông thường'
    }
  },
  country: { 
    type: String,
    default: 'Vietnam'
  },
  dateOfBirth: { 
    type: Date,
    validate: {
      validator: function(v) {
        return this.isGoogleUser ? true : Boolean(v);
      },
      message: 'Ngày sinh không được để trống với tài khoản thông thường'
    }
  },
  profilePicture: { 
    type: String, 
    default: null 
  },
  status: { 
    type: String, 
    enum: ["active", "inactive", "suspended"], 
    default: "active" 
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
  email_verified_at: {
    type: Date,
    default: function() {
      return this.isGoogleUser ? Date.now() : null;
    }
  },
  google_refresh_token: {
    type: String,
    default: null
  },
  otp: { 
    type: String,
    select: false
  },
  otpExpires: { 
    type: Date,
    select: false
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpLockUntil: {
    type: Date,
    default: null
  }
});

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Convert email to lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  
  // Xử lý phone field cho Google users - chỉ khi tạo mới
  if (this.isGoogleUser && this.isNew && !this.phone) {
    // Tạo phone unique bằng cách thêm timestamp để tránh duplicate null
    this.phone = `google_${this._id}_${Date.now()}`;
  }
  
  // Validate required fields for non-Google users
  if (!this.isGoogleUser) {
    if (!this.phone) {
      next(new Error('Số điện thoại không được để trống với tài khoản thông thường'));
    }
    if (!this.password) {
      next(new Error('Mật khẩu không được để trống với tài khoản thông thường'));
    }
    if (!this.address) {
      next(new Error('Địa chỉ không được để trống với tài khoản thông thường'));
    }
    if (!this.dateOfBirth) {
      next(new Error('Ngày sinh không được để trống với tài khoản thông thường'));
    }
  }
  
  next();
});

// Chỉ tạo unique index cho email
userSchema.index({ email: 1 }, { unique: true });

// Tạo index cho phone với unique constraint
userSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model("users", userSchema);