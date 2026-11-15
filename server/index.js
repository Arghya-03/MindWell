
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const journalRoutes = require("./routes/journalRoutes");
const moodRoutes = require("./routes/moodRoutes");
const moodCheckinRoutes = require("./routes/moodCheckinRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Journal Routes
app.use("/api/journals", journalRoutes);

// Mood Analytics Routes
app.use("/api/moods", moodRoutes);

// Mood Check-in Routes
app.use("/api/mood-checkins", moodCheckinRoutes);

app.use("/api/payments", paymentRoutes);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    });

// Basic API route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to MindWell API!",
        status: "Server is running successfully",
    });
});

// Server configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`MindWell Server running on port ${PORT}`);
});
