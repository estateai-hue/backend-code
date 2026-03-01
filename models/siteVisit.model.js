import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: String,
    phone: String,
    visitDate: Date,
    message: String,
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SiteVisit", siteVisitSchema);