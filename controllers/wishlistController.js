import { io } from "../server.js";
import Wishlist from "../models/Wishlist.js";

export const addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const wishlist = await Wishlist.create({
      user: req.user.id,
      property: propertyId,
    });

    // 🔥 Emit updated wishlist count
    const count = await Wishlist.countDocuments({ user: req.user.id });

    io.to(req.user.id).emit("wishlistUpdated", count);

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate("property");

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      user: req.user.id,
      property: req.params.propertyId,
    });

    const count = await Wishlist.countDocuments({ user: req.user.id });

    io.to(req.user.id).emit("wishlistUpdated", count);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const checkWhishList = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
    }

    const exists = await Wishlist.findOne({
      user: req.user.id,
      property: propertyId,
    });

    res.status(200).json({
      success: true,
      liked: !!exists,
    });

  } catch (error) {
    console.error("Check Wishlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const countWishlist = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const count = await Wishlist.countDocuments({
      user: req.user.id,
    });

    res.status(200).json({
      success: true,
      count,
    });

  } catch (error) {
    console.error("Count Wishlist Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};