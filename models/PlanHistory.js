import mongoose from "mongoose";

const planHistorySchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  },

  oldPlan: { type: String, required: true },
  newPlan: { type: String, required: true },
  amount: { type: Number, required: true },

  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("PlanHistory", planHistorySchema);
