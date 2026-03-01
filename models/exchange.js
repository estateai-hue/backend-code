import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  from: String,
  to: String,
  rate: Number,
  updatedAt: Date,
});

export default mongoose.model("Currency", currencySchema);