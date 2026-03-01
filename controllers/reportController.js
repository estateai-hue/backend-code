import Lead from "../models/Lead.js";

export const getAgentPerformance = async (req, res) => {
  const performance = await Lead.aggregate([
    {
      $match: {
        companyId: req.user.companyId,
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        totalLeads: { $sum: 1 },
        closedLeads: {
          $sum: {
            $cond: [{ $eq: ["$status", "closed"] }, 1, 0],
          },
        },
      },
    },
  ]);

  res.json(performance);
};