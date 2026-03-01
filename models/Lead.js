import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    clientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    clientPhone: {
      type: String,
      trim: true,
    },

    requirement: {
      type: String,
      trim: true,
    },

    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true, // 🔥 Important (multi-company filter)
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // 🔥 Used in agent dashboard
    },

    source: {
      type: String,
      enum: ["website", "chatbot", "manual"],
      default: "website",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "closed", "overdue"],
      default: "new",
      index: true, // 🔥 Filtering by status
    },

    followUpDate: {
      type: Date,
      index: true, // 🔥 Overdue & reminders
    },

    lastContactedAt: Date,

    followUpCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


// =====================================
// 🔥 COMPOUND INDEXES (Very Important)
// =====================================

// Company + Assigned Agent (Agent dashboard)
leadSchema.index({ companyId: 1, assignedTo: 1, isDeleted: 1 });
leadSchema.index({ companyId: 1, status: 1, isDeleted: 1 });
leadSchema.index({ companyId: 1, followUpDate: 1, isDeleted: 1 });

// Search performance (text search)
leadSchema.index({
  clientName: "text",
  clientEmail: "text",
  clientPhone: "text",
});

export default mongoose.model("Lead", leadSchema);