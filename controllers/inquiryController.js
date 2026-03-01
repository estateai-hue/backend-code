import Inquiry from "../models/Inquiry.js";

export const createInquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;

    const inquiry = new Inquiry({
      property: propertyId,
      user: req.user.id, // if using auth
      message,
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      message: "Inquiry created successfully",
      inquiry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create inquiry",
    });
  }
};
