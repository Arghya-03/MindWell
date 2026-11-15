
const express = require("express");
const router = express.Router();

const {
  getMoodAnalytics,
} = require("../controllers/analytics/moodController");

const protect = require("../middleware/authMiddleware");
const requirePremium = require("../middleware/premiumMiddleware");

// Get protected mood analytics
router.get("/", protect, requirePremium, getMoodAnalytics);

module.exports = router;
