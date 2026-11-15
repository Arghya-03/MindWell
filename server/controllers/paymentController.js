
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const User = require("../models/User");

const PREMIUM_AMOUNT = 49900; // ₹499 in paise

// Create Razorpay payment order
exports.createOrder = async (req, res) => {
    try {
        const options = {
            amount: PREMIUM_AMOUNT,
            currency: "INR",
            receipt: `mindwell_${req.user.id}_${Date.now()}`,
            notes: {
                userId: req.user.id,
                plan: "MindWell Premium",
            },
        };

        const order = await razorpay.orders.create(options);

        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            order,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Razorpay order creation failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create payment order",
        });
    }
};


// Verify Razorpay payment and activate Premium
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification details are missing.",
            });
        }

        // Generate the expected Razorpay signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const receivedBuffer = Buffer.from(razorpay_signature, "hex");

        if (
            expectedBuffer.length !== receivedBuffer.length ||
            !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature.",
            });
        }

        // Fetch the order directly from Razorpay
        const order = await razorpay.orders.fetch(razorpay_order_id);

        // Ensure the order belongs to the logged-in user
        if (
            !order ||
            order.notes?.userId !== req.user.id ||
            order.amount !== PREMIUM_AMOUNT ||
            order.currency !== "INR"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment order verification failed.",
            });
        }

        // Verify the actual payment with Razorpay
        const payment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== "captured" ||
            payment.amount !== PREMIUM_AMOUNT ||
            payment.currency !== "INR"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment has not been successfully captured.",
            });
        }

        // Activate Premium only after successful verification
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { isPremium: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "MindWell Premium activated successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
            },
        });

    } catch (error) {
        console.error("Payment verification failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to verify payment.",
        });
    }
};

