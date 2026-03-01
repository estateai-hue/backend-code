import mongoose from "mongoose";
import Lead from "./models/Lead.js";
import dotenv from "dotenv";

dotenv.config();

const migrateLeads = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Lead.updateMany(
      {
        $or: [
          { clientPhone: { $exists: false } },
          { requirement: { $exists: false } },
          { followUpCount: { $exists: false } }
        ]
      },
      {
        $set: {
          clientPhone: "",
          requirement: "",
          followUpCount: 0
        }
      }
    );

    console.log("Migration completed:", result);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

migrateLeads();