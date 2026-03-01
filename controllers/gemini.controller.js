import { askGemini } from "../services/gemini.service.js";
import Property from "../models/Property.js";

export const geminiChat = async (req, res) => {
  const { message } = req.body;

  const filters = await askGemini(message);

  const properties = await Property.find({
    location: { $regex: filters.location, $options: "i" }
  });

  res.json({ filters, properties });
};
