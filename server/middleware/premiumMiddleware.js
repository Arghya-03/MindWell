
const User = require("../models/User");

const requirePremium = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.isPremium) {
            return res.status(403).json({
                success: false,
                message: "This feature is available only for Premium users.",
                premiumRequired: true,
            });
        }

        next();
    } catch (error) {
        console.error("Premium access check failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to verify Premium access.",
        });
    }
};

module.exports = requirePremium;
