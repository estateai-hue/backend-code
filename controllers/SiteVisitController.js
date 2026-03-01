import SiteVisit from "../models/siteVisit.model.js";

export const createSiteVisit = async (req, res) => {
  try {
    const { propertyId, name, email, phone, visitDate, message } = req.body;

    const visit = await SiteVisit.create({
      propertyId,
      userId: req.user._id,
      name,
      email,
      phone,
      visitDate,
      message,
    });

    res.status(201).json(visit);
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule visit" });
  }
};