const express = require("express");
  const userController = require("../controllers/usersController"); // Sửa từ userController thành usersController
  const { isAuthenticated } = require("../middleware/auth");

  const router = express.Router();

  router.get("/", userController.getAllUsers);
  router.get("/:userId", isAuthenticated, userController.getUserDetails);
  router.post("/", userController.addUser); // Route POST cho đăng ký
  router.patch("/:userId/status", isAuthenticated, userController.updateUserStatus);
  router.patch("/:userId", isAuthenticated, userController.updateUser);

  module.exports = router;