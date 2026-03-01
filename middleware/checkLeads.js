import Company from "../models/Company.js";

export const checkLeadsLimit = async (req, res, next) => {
  const company = await Company.findOne({ owner: req.user._id });

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  // Check expiry
  if (new Date() > company.planExpiryDate) {
    return res.status(403).json({ message: "Plan expired" });
  }

  // Unlimited plan
  if (company.plan.leadsLimit === -1) {
    return next();
  }

  // Standard plan (5 per day)
  if (company.plan.name === "standard") {
    if (company.leadsUsed >= 5) {
      return res.status(403).json({ message: "Daily leads limit reached" });
    }
  } else {
    if (company.leadsUsed >= company.plan.leadsLimit) {
      return res.status(403).json({ message: "Leads limit reached" });
    }
  }

  next();
};
