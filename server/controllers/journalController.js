
const Journal = require("../models/Journal");
const { encryptText, decryptText } = require("../utils/encryption");

// CREATE JOURNAL ENTRY
exports.createJournal = async (req, res) => {
  try {
    const { content, mood, emotions, energyLevel, prompt } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Journal content is required",
      });
    }

    const moodScore = Number(mood);
    const energyScore = Number(energyLevel ?? 5);

    if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 10) {
      return res.status(400).json({
        success: false,
        message: "Mood must be a number between 1 and 10",
      });
    }

    if (
      !Number.isInteger(energyScore) ||
      energyScore < 1 ||
      energyScore > 10
    ) {
      return res.status(400).json({
        success: false,
        message: "Energy level must be a number between 1 and 10",
      });
    }

    const encrypted = encryptText(content.trim());

    const journal = await Journal.create({
      user: req.user.id,
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      mood: moodScore,
      emotions: Array.isArray(emotions) ? emotions : [],
      energyLevel: energyScore,
      prompt: typeof prompt === "string" ? prompt.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Journal entry saved securely",
      journal: {
        id: journal._id,
        mood: journal.mood,
        emotions: journal.emotions,
        energyLevel: journal.energyLevel,
        prompt: journal.prompt,
        createdAt: journal.createdAt,
      },
    });
  } catch (error) {
    console.error("Create journal error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save journal entry",
    });
  }
};

// GET CURRENT USER'S JOURNAL ENTRIES
exports.getJournals = async (req, res) => {
  try {
    const User = require("../models/User");

    const user = await User.findById(req.user.id).select("isPremium");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const journalQuery = Journal.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    if (!user.isPremium) {
      journalQuery.limit(7);
    }

    const journals = await journalQuery;

    const decryptedJournals = journals.map((journal) => ({
      id: journal._id,
      content: decryptText(
        journal.encryptedContent,
        journal.iv,
        journal.authTag
      ),
      mood: journal.mood,
      emotions: journal.emotions,
      energyLevel: journal.energyLevel,
      prompt: journal.prompt,
      createdAt: journal.createdAt,
      updatedAt: journal.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: decryptedJournals.length,
      journals: decryptedJournals,
    });
  } catch (error) {
    console.error("Get journals error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve journal entries",
    });
  }
};


// EXPORT JOURNAL ENTRIES AS JSON
exports.exportJournals = async (req, res) => {
  try {
    const journals = await Journal.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    const exportData = journals.map((journal) => ({
      id: journal._id,
      content: decryptText(
        journal.encryptedContent,
        journal.iv,
        journal.authTag
      ),
      mood: journal.mood,
      emotions: journal.emotions,
      energyLevel: journal.energyLevel,
      prompt: journal.prompt,
      createdAt: journal.createdAt,
      updatedAt: journal.updatedAt,
    }));

    const fileName = `mindwell-journals-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );

    return res.status(200).send(
      JSON.stringify(
        {
          success: true,
          exportedAt: new Date().toISOString(),
          count: exportData.length,
          journals: exportData,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Export journals error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to export journal entries",
    });
  }
};

// UPDATE JOURNAL ENTRY
exports.updateJournal = async (req, res) => {
  try {
    const { content, mood, emotions, energyLevel, prompt } = req.body;

    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    if (content !== undefined) {
      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Journal content cannot be empty",
        });
      }

      const encrypted = encryptText(content.trim());

      journal.encryptedContent = encrypted.encryptedContent;
      journal.iv = encrypted.iv;
      journal.authTag = encrypted.authTag;
    }

    if (mood !== undefined) {
      const moodScore = Number(mood);

      if (!Number.isInteger(moodScore) || moodScore < 1 || moodScore > 10) {
        return res.status(400).json({
          success: false,
          message: "Mood must be between 1 and 10",
        });
      }

      journal.mood = moodScore;
    }

    if (energyLevel !== undefined) {
      const energyScore = Number(energyLevel);

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

      journal.energyLevel = energyScore;
    }

    if (emotions !== undefined) {
      if (!Array.isArray(emotions)) {
        return res.status(400).json({
          success: false,
          message: "Emotions must be an array",
        });
      }

      journal.emotions = emotions;
    }

    if (prompt !== undefined) {
      if (typeof prompt !== "string") {
        return res.status(400).json({
          success: false,
          message: "Prompt must be a string",
        });
      }

      journal.prompt = prompt.trim();
    }

    await journal.save();

    return res.status(200).json({
      success: true,
      message: "Journal entry updated successfully",
      journal: {
        id: journal._id,
        mood: journal.mood,
        emotions: journal.emotions,
        energyLevel: journal.energyLevel,
        prompt: journal.prompt,
        updatedAt: journal.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update journal error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update journal entry",
    });
  }
};


// DELETE JOURNAL ENTRY
exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: "Journal entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete journal error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete journal entry",
    });
  }
};


// PREMIUM: SEARCH JOURNAL ENTRIES
exports.searchJournals = async (req, res) => {
  try {
    const { q, from, to } = req.query;

    const keyword = typeof q === "string" ? q.trim() : "";

    if (keyword.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search keyword cannot exceed 100 characters",
      });
    }

    if (!keyword && !from && !to) {
      return res.status(400).json({
        success: false,
        message: "Provide a keyword or date filter",
      });
    }

    const dateFilter = {};

    if (from) {
      const startDate = new Date(from);

      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date",
        });
      }

      dateFilter.$gte = startDate;
    }

    if (to) {
      const endDate = new Date(to);

      if (Number.isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date",
        });
      }

      endDate.setUTCHours(23, 59, 59, 999);
      dateFilter.$lte = endDate;
    }

    if (
      dateFilter.$gte &&
      dateFilter.$lte &&
      dateFilter.$gte > dateFilter.$lte
    ) {
      return res.status(400).json({
        success: false,
        message: "Start date cannot be after end date",
      });
    }

    const filter = {
      user: req.user.id,
    };

    if (Object.keys(dateFilter).length > 0) {
      filter.createdAt = dateFilter;
    }

    const journals = await Journal.find(filter).sort({
      createdAt: -1,
    });

    const matchingJournals = journals
      .map((journal) => {
        const content = decryptText(
          journal.encryptedContent,
          journal.iv,
          journal.authTag
        );

        return {
          id: journal._id,
          content,
          mood: journal.mood,
          emotions: journal.emotions,
          energyLevel: journal.energyLevel,
          prompt: journal.prompt,
          createdAt: journal.createdAt,
          updatedAt: journal.updatedAt,
        };
      })
      .filter((journal) => {
        if (!keyword) return true;

        const searchableText = [
          journal.content,
          journal.prompt,
          ...journal.emotions,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(keyword.toLowerCase());
      });

    return res.status(200).json({
      success: true,
      count: matchingJournals.length,
      journals: matchingJournals,
    });
  } catch (error) {
    console.error("Search journals error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to search journal entries",
    });
  }
};
