
const express = require("express");
const router = express.Router();

const {
  createMood,
  getMoods,
} = require("../controllers/moodController");

const protect = require("../middleware/authMiddleware");

// Save a mood check-in
router.post("/", protect, createMood);

// Get current user's mood check-ins
router.get("/", protect, getMoods);

module.exports = router;
