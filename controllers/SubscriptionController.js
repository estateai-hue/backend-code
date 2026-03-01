import { razorpay } from "../config/razorpay.js";

export const createSubscription = async (req, res) => {
  try {
    const { razorpayPlanId } = req.body;

    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
