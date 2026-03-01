import Currency from "../models/exchange.js";

import axios from "axios";

export const getExchangeRate = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "Missing params" });
    }

    // 🔥 FIX: same currency
    if (from === to) {
      return res.json({ rate: 1 });
    }

    const response = await axios.get(
      "https://api.frankfurter.app/latest",
      { params: { from, to } }
    );

    const rate = response.data.rates?.[to];

    if (!rate) {
      return res.status(400).json({ message: "Invalid currency" });
    }

    res.json({ rate });

  } catch (error) {
    console.error("Exchange API Error:", error.message);
    res.status(500).json({ message: "Failed to fetch rate" });
  }
};