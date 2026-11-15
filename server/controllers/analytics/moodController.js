
const Journal = require("../../models/Journal");
const Mood = require("../../models/Mood");

// GET MOOD ANALYTICS
exports.getMoodAnalytics = async (req, res) => {
  try {
    const { period = "weekly" } = req.query;

    if (!["weekly", "monthly"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Period must be weekly or monthly",
      });
    }

    const now = new Date();
    const startDate = new Date(now);

    if (period === "weekly") {
      startDate.setDate(now.getDate() - 6);
    } else {
      startDate.setDate(now.getDate() - 29);
    }

    startDate.setHours(0, 0, 0, 0);

    // Fetch journal-based mood records
    const journalEntries = await Journal.find({
      user: req.user.id,
      createdAt: { $gte: startDate, $lte: now },
    })
      .select("mood emotions energyLevel createdAt")
      .lean();

    // Fetch independent mood check-ins
    const moodEntries = await Mood.find({
      user: req.user.id,
      createdAt: { $gte: startDate, $lte: now },
    })
      .select("mood emotions energyLevel createdAt")
      .lean();

    // Combine both collections
    const allEntries = [...journalEntries, ...moodEntries].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const averageMood =
      allEntries.length > 0
        ? Number(
          (
            allEntries.reduce((sum, entry) => sum + entry.mood, 0) /
            allEntries.length
          ).toFixed(1)
        )
        : 0;

    const averageEnergy =
      allEntries.length > 0
        ? Number(
          (
            allEntries.reduce(
              (sum, entry) => sum + entry.energyLevel,
              0
            ) / allEntries.length
          ).toFixed(1)
        )
        : 0;

    const emotionCounts = {};

    allEntries.forEach((entry) => {
      entry.emotions.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const moodHistory = allEntries.map((entry) => ({
      date: entry.createdAt,
      mood: entry.mood,
      energyLevel: entry.energyLevel,
    }));


    // PREMIUM WELLNESS INSIGHTS

    // Identify the most frequently recorded emotion
    const sortedEmotions = Object.entries(emotionCounts).sort(
      (a, b) => b[1] - a[1]
    );

    const mostFrequentEmotion =
      sortedEmotions.length > 0 ? sortedEmotions[0][0] : "Not enough data";

    // Compare the first and second halves of the mood history
    const midpoint = Math.floor(allEntries.length / 2);

    const firstHalf = allEntries.slice(0, midpoint);
    const secondHalf = allEntries.slice(midpoint);

    const calculateAverage = (entries) =>
      entries.length > 0
        ? entries.reduce((sum, entry) => sum + entry.mood, 0) /
        entries.length
        : 0;

    const firstAverage = calculateAverage(firstHalf);
    const secondAverage = calculateAverage(secondHalf);

    let moodTrend = "Not enough data";

    if (allEntries.length >= 2) {
      if (secondAverage - firstAverage >= 0.5) {
        moodTrend = "Improving";
      } else if (firstAverage - secondAverage >= 0.5) {
        moodTrend = "Declining";
      } else {
        moodTrend = "Stable";
      }
    }

    // Generate a supportive wellness message
    let wellnessMessage =
      "Keep recording your feelings to discover your wellness patterns.";

    if (allEntries.length >= 2) {
      if (averageMood >= 8) {
        wellnessMessage =
          "Your recent mood scores are positive. Keep nurturing the activities that support your wellbeing.";
      } else if (averageMood >= 5) {
        wellnessMessage =
          "Your mood scores show some ups and downs. Take time for activities that help you feel balanced.";
      } else {
        wellnessMessage =
          "Your recent mood scores have been lower. Be gentle with yourself and consider reaching out to someone you trust.";
      }
    }



    return res.status(200).json({
      success: true,
      period,
      totalEntries: allEntries.length,
      averageMood,
      averageEnergy,
      emotionCounts,
      moodHistory,

      wellnessInsights: {
        mostFrequentEmotion,
        moodTrend,
        wellnessMessage,
      },
    });

  } catch (error) {
    console.error("Mood analytics error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch mood analytics",
    });
  }
};
