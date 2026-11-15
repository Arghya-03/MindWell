
const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mood: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    energyLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5,
    },

    emotions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

moodSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Mood", moodSchema);
