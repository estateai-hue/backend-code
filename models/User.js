import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: {
      type: String,
    },
    
    role: {
      type: String,
      enum: ["superadmin", "agent", "user"],
      default: "user"
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.role === "agent";
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);