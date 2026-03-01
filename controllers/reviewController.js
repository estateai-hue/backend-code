import Review from "../models/reviewModel.js";

// GET reviews by property
export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      propertyId: req.params.propertyId,
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// POST add review
export const addReview = async (req, res) => {
  try {
    const { user, rating, comment } = req.body;

    const review = await Review.create({
      propertyId: req.params.propertyId,
      user,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error adding review" });
  }
};