import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    gstNumber: String,
    password: String,

    plan: {
      name: {
        type: String,
        enum: ["free", "basic", "standard", "business"],
        default: "free"
      },
      price: Number,
      duration: String, // weekly, monthly, yearly
      leadsLimit: Number, // -1 = unlimited
      support: Boolean
    },

    planStartDate: {
      type: Date,
      default: Date.now
    },

    planExpiryDate: Date,

    leadsUsed: {
      type: Number,
      default: 0
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
