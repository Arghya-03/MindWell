
import API from "./api";

// Create Razorpay payment order
export const createPaymentOrder = async () => {
    const response = await API.post("/payments/create-order");
    return response.data;
};

// Verify Razorpay payment
export const verifyPayment = async (paymentData) => {
    const response = await API.post("/payments/verify", paymentData);
    return response.data;
};
