require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const templatesRoutes = require("./routes/templates");
const weddingInvitationRoutes = require('./routes/weddingInvitationRoutes');
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser"); // Thêm cookie-parser
const multer = require("multer"); // Thêm multer
const path = require("path"); // Thêm path module

const app = express();
const PORT = process.env.PORT || 3001;

// Cấu hình multer cho upload ảnh
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
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Chỉ hỗ trợ file ảnh (jpeg, jpg, png, gif)"));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// CORS configuration
const corsOptions = {
  origin: [`http://localhost:${process.env.PORT || 3001}`, `http://localhost:${process.env.FRONTEND_PORT || 3000}`],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser()); // Sử dụng cookie-parser

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use(session({ 
  secret: process.env.JWT_SECRET, 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        const googleProfilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
            isGoogleUser: true,
            status: "active",
            profilePicture: googleProfilePicture,
            google_refresh_token: refreshToken
          });
          await user.save();
        } else {
          // Cập nhật thông tin cho user đã tồn tại
          user.google_refresh_token = refreshToken;
          if (googleProfilePicture && !user.profilePicture) {
            user.profilePicture = googleProfilePicture;
          }
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wedding-invitation", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/templates", templatesRoutes);
app.use('/api/wedding-invitations', weddingInvitationRoutes);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});