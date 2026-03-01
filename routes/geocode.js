// routes/geocode.js
import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ message: "Location required" });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          format: "json",
          q: location,
          limit: 1,
        },
        headers: {
          "User-Agent": "real-estate-app",
        },
      }
    );

    if (response.data.length === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({
      latitude: response.data[0].lat,
      longitude: response.data[0].lon,
    });

  } catch (error) {
    res.status(500).json({ message: "Geocoding failed" });
  }
});

export default router;
