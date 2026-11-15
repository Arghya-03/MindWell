
const Mood = require("../models/Mood");

// CREATE MOOD CHECK-IN
exports.createMood = async (req, res) => {
  try {
    const { mood, energyLevel, emotions } = req.body;

    const moodScore = Number(mood);
    const energyScore = Number(energyLevel ?? 5);

    if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 10) {
      return res.status(400).json({
        success: false,
        message: "Mood must be between 1 and 10",
      });
    }

    if (
      !Number.isInteger(energyScore) ||
      energyScore < 1 ||
      energyScore > 10
    ) {
      return res.status(400).json({
        success: false,
        message: "Energy level must be between 1 and 10",
      });
    }

    if (
      emotions !== undefined &&
      (!Array.isArray(emotions) ||
        !emotions.every((emotion) => typeof emotion === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Emotions must be an array of strings",
      });
    }

    const moodEntry = await Mood.create({
      user: req.user.id,
      mood: moodScore,
      energyLevel: energyScore,
      emotions: emotions || [],
    });

    return res.status(201).json({
      success: true,
      message: "Mood check-in saved successfully",
      mood: moodEntry,
    });
  } catch (error) {
    console.error("Create mood error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save mood check-in",
    });
  }
};

// GET CURRENT USER'S MOOD CHECK-INS
exports.getMoods = async (req, res) => {
  try {
    const moods = await Mood.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: moods.length,
      moods,
    });
  } catch (error) {
    console.error("Get moods error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve mood check-ins",
    });
  }
};
