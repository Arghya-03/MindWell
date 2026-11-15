
require("dotenv").config();

// Validate required environment variables
const requiredEnvVariables = [
  "MONGO_URI",
  "JWT_SECRET",
  "ENCRYPTION_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const missingEnvVariables = requiredEnvVariables.filter(
  (variable) => !process.env[variable]
);

if (missingEnvVariables.length > 0) {
  console.error(
    "Missing required environment variables:",
    missingEnvVariables.join(", ")
  );

  process.exit(1);
}

// Validate encryption key format
if (!/^[0-9a-fA-F]{64}$/.test(process.env.ENCRYPTION_KEY)) {
  console.error(
    "ENCRYPTION_KEY must be a valid 64-character hexadecimal key."
  );

  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const journalRoutes = require("./routes/journalRoutes");
const moodRoutes = require("./routes/moodRoutes");
const moodCheckinRoutes = require("./routes/moodCheckinRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
  },
});

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Apply rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);



// Request body size limit
app.use(express.json({ limit: "1mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/mood-checkins", moodCheckinRoutes);
app.use("/api/payments", paymentRoutes);

// Basic API route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to MindWell API!",
    status: "Server is running successfully",
  });
});

// MongoDB connection and server startup
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`MindWell Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
