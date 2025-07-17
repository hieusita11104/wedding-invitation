const express = require("express");
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");
const { isAuthenticated } = require("../middleware/auth");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin người dùng" });
  }
});
router.post("/register", usersController.addUser);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/api/auth/login" }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
  // Set cookie with proper configuration for cross-origin
  const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };
  
  res.cookie("token", token, cookieOptions);
  console.log("Google OAuth - Cookie set with options:", cookieOptions);
  res.redirect(`http://localhost:3000?role=${req.user.role}`);
});

module.exports = router;