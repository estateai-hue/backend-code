import Lead from "../models/Lead.js";
import LeadNote from "../models/LeadNote.js";

export const addLeadNote = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { note } = req.body;

    if (!note || note.trim() === "") {
      return res.status(400).json({ message: "Note is required" });
    }

    const query = {
      _id: leadId,
      companyId: req.user.companyId,
      isDeleted: false,
    };

    // Agent can only add note to their assigned leads
    if (req.user.role === "agent") {
      query.assignedTo = req.user._id;
    }

    const lead = await Lead.findOne(query);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const newNote = await LeadNote.create({
      leadId,
      companyId: req.user.companyId,
      addedBy: req.user._id,
      note,
    });

    res.status(201).json({
      message: "Note added successfully",
      note: newNote,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLeadNotes = async (req, res) => {
  try {
    const { leadId } = req.params;

    const notes = await LeadNote.find({
      leadId,
      companyId: req.user.companyId,
    })
      .populate("addedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ notes });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};