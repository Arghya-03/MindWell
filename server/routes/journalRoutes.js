
const express = require("express");
const router = express.Router();

const {
  createJournal,
  getJournals,
  exportJournals,
  updateJournal,
  deleteJournal,
  searchJournals,
} = require("../controllers/journalController");

const protect = require("../middleware/authMiddleware");

const requirePremium = require("../middleware/premiumMiddleware");

// Create a journal entry
router.post("/", protect, createJournal);

// Get logged-in user's journal entries
router.get("/", protect, getJournals);

// Export logged-in user's journal entries
router.get("/export", protect, exportJournals);

// Update a journal entry
router.put("/:id", protect, updateJournal);

// Delete a journal entry
router.delete("/:id", protect, deleteJournal);

// Search journal entries (Premium feature)
router.get("/search", protect, requirePremium, searchJournals);

module.exports = router;
