const User = require("../models/User");
const WeddingInvitation = require("../models/WeddingInvitation");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Chỉ hỗ trợ file ảnh (jpeg, jpg, png, gif)"));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single("profilePicture");

exports.getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await User.find().select("-password").sort({ registeredAt: -1 });

    const usersWithInvitationCount = await Promise.all(
      users.map(async (user) => {
        const invitationCount = await WeddingInvitation.countDocuments({ user: user._id });
        const userObj = user.toObject();
        return {
          ...userObj,
          weddingInvitationCount: invitationCount,
        };
      })
    );

    console.log(`Found ${users.length} users`);
    res.status(200).json(usersWithInvitationCount);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.userId === "me" ? req.user._id : req.params.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const weddingInvitations = await WeddingInvitation.find({ user: userId })
      .populate("template", "name thumbnail")
      .sort({ createdAt: -1 });

    res.status(200).json({
      user,
      weddingInvitations,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      message: "Không thể tải thông tin người dùng",
      error: error.message,
    });
  }
};

exports.addUser = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      console.log("Adding new user with data:", JSON.stringify(req.body, null, 2));

      const { name, email, role, gender, phone, password, address, country, dateOfBirth, status } = req.body;

      const requiredFields = ["name", "email", "phone", "password", "address", "country", "dateOfBirth"];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        console.log("Missing required fields:", missingFields);
        return res.status(400).json({
          message: `Vui lòng điền đầy đủ các trường: ${missingFields.join(", ")}`,
          missingFields,
        });
      }

      const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
      if (existingUser) {
        if (existingUser.phone === phone) {
          return res.status(400).json({
            message: `Số điện thoại ${phone} đã được đăng ký. Vui lòng sử dụng số khác.`,
            field: "phone",
          });
        }
        if (existingUser.email === email) {
          return res.status(400).json({
            message: `Email ${email} đã được đăng ký. Vui lòng sử dụng email khác.`,
            field: "email",
          });
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        name,
        email,
        role,
        gender,
        phone,
        password: hashedPassword,
        address,
        country,
        dateOfBirth,
        profilePicture: req.file ? `/uploads/${req.file.filename}` : null,
        status: status || "active",
      });

      console.log("Saving user to database...");
      await newUser.save();
      console.log("User saved successfully");

      const userResponse = newUser.toObject();
      delete userResponse.password;

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
              // Set cookie with proper configuration for cross-origin
        const cookieOptions = {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        };
        
        res.cookie("token", token, cookieOptions);
        console.log("Register - Cookie set with options:", cookieOptions);
      res.status(201).json({ message: "Đăng ký thành công", user: userResponse, token });
    } catch (error) {
      console.error("Error adding user:", error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const value = error.keyValue[field];
        return res.status(400).json({
          message: `${field === "phone" ? "Số điện thoại" : "Email"} ${value} đã được đăng ký. Vui lòng sử dụng ${field === "phone" ? "số điện thoại" : "email"} khác.`,
          field,
        });
      }

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          message: "Lỗi dữ liệu",
          errors,
        });
      }

      res.status(500).json({
        message: "Lỗi khi đăng ký",
        error: error.message,
      });
    }
  });
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      message: "Cập nhật trạng thái thành công",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      message: "Lỗi khi cập nhật trạng thái",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    delete updateData.password;
    delete updateData._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    Object.assign(user, updateData);
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(400).json({
        message: `${field === "phone" ? "Số điện thoại" : "Email"} ${value} đã được sử dụng. Vui lòng sử dụng ${field === "phone" ? "số điện thoại" : "email"} khác.`,
        field,
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Lỗi dữ liệu",
        errors,
      });
    }

    res.status(500).json({
      message: "Không thể cập nhật thông tin người dùng",
      error: error.message,
    });
  }
};