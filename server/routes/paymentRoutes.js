
const express = require("express");
const router = express.Router();

const {
    createOrder,
    verifyPayment,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

// Create a payment order
router.post("/create-order", protect, createOrder);

// Verify payment and activate Premium
router.post("/verify", protect, verifyPayment);

module.exports = router;
