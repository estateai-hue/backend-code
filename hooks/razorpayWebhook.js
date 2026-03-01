import crypto from "crypto";

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;

  if (event === "subscription.activated") {
    const subscriptionId = req.body.payload.subscription.entity.id;

    // 🔥 Activate plan in DB
    // find company by subscriptionId and update planActive = true
  }

  res.json({ status: "ok" });
};
