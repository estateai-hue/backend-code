import Property from "../models/Property.js";
import { emitDashboardStats } from "./adminController.js";
import qs from "qs";

/**
 * CREATE PROPERTY
 * Admin & Agent
 */
export const createProperty = async (req, res) => {
  try {
    const imagePaths = req.files?.map(file =>
      file.path.replace(/\\/g, "/")
    ) || [];

    // Parse nested form-data
    const parsedBody = qs.parse(req.body);

    // Convert numbers properly
    parsedBody.price.amount = Number(parsedBody.price.amount);
    parsedBody.superBuiltupArea.value = Number(parsedBody.superBuiltupArea.value);
    parsedBody.bedrooms = Number(parsedBody.bedrooms);
    parsedBody.bathrooms = Number(parsedBody.bathrooms);
    parsedBody.balconies = Number(parsedBody.balconies);
    parsedBody.floor = Number(parsedBody.floor);
    parsedBody.ageOfConstruction = Number(parsedBody.ageOfConstruction);
    parsedBody.latitude = Number(parsedBody.latitude);
    parsedBody.longitude = Number(parsedBody.longitude);

    // Parse amenities
    if (parsedBody.amenities) {
      parsedBody.amenities = JSON.parse(parsedBody.amenities);
    }

    const property = await Property.create({
      ...parsedBody,
      images: imagePaths,
      ownerId: req.user.id,
    });

    res.status(201).json(property);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
/**
 * GET PROPERTIES
 * Admin → All
 * Agent → Own
 * Client → All
 */
export const getAllProperties = async (req, res) => {
  try {

    let properties;

    if (req.user.role === "agent") {
      properties = await Property.find({
        ownerId: req.user.id
      });
    } else {
      properties = await Property.find().populate("ownerId", "name email");
    }

    res.json(properties);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE PROPERTY
 * Admin Only
 */
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Optional: Only owner can delete
    if (property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();

    res.json({ message: "Property deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("ownerId", "name email phone");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProperty = async (req, res) => {
  try {

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Agent can only update their own property
    if (
      req.user.role === "agent" &&
      property.ownerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    Object.assign(property, req.body);
    await property.save();

    res.json(property);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      sort,
    } = req.query;

    const query = {};

    // 🔎 SEARCH
    if (search) {
      query.$text = { $search: search };
    }

    // 💰 PRICE FILTER
    if (minPrice || maxPrice) {
      query["price.amount"] = {};
      if (minPrice) query["price.amount"].$gte = Number(minPrice);
      if (maxPrice) query["price.amount"].$lte = Number(maxPrice);
    }

    // 🔄 SORTING
    let sortOption = {};

    if (sort === "price-asc") sortOption["price.amount"] = 1;
    if (sort === "price-desc") sortOption["price.amount"] = -1;
    if (sort === "newest") sortOption["createdAt"] = -1;
    if (sort === "oldest") sortOption["createdAt"] = 1;

    // 📄 PAGINATION
    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: properties,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSimilarProperties = async (req, res) => {
  try {
    const { id } = req.params;

    const currentProperty = await Property.findById(id);

    if (!currentProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    const minPrice = currentProperty.price.amount * 0.8;
    const maxPrice = currentProperty.price.amount * 1.2;

    const similar = await Property.find({
      _id: { $ne: id }, // exclude current
      type: currentProperty.type,
      transactionType: currentProperty.transactionType,
      "price.amount": { $gte: minPrice, $lte: maxPrice },
      status: "active",
    })
      .limit(6)
      .sort({ createdAt: -1 });

    res.json(similar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleLikeProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    const userId = req.user.id;

    const alreadyLiked = property.likes.includes(userId);

    if (alreadyLiked) {
      property.likes.pull(userId);
    } else {
      property.likes.push(userId);
    }

    await property.save();

    res.json({ likes: property.likes.length });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

