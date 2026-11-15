
const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    encryptedContent: {
      type: String,
      required: true,
    },

    iv: {
      type: String,
      required: true,
    },

    authTag: {
      type: String,
      required: true,
    },

    mood: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },

    emotions: {
      type: [String],
      default: [],
    },

    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },

    prompt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Journal", journalSchema);
