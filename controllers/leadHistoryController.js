import LeadHistory from "../models/LeadHistory.js";

export const getLeadHistory = async (req, res) => {
  try {
    const histories = await LeadHistory.find({
      leadId: req.params.id,
      companyId: req.user.companyId, 
    })
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(histories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};