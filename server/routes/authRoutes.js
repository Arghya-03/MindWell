
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

// User Registration
router.post("/register", register);

// User Login
router.post("/login", login);

// Protected User Profile
router.get("/me", protect, getMe);

module.exports = router;
