/**
 * Admin-only: escalation checks, escalation list, admin notes, follow-up.
 * Only Admin role can access these endpoints.
 */

const Complaint = require('../models/Complaint');
const { checkEscalations, getLastOfficialActivity } = require('../services/escalationService');
const { enrichComplaint } = require('../services/priorityScoreService');

const ESCALATION_ORDER = { 'Resolution Delayed': 2, 'Response Delayed': 1, 'None': 0 };

/**
 * Run escalation check (manual trigger for demo).
 * POST /api/admin/check-escalations
 */
exports.runCheckEscalations = async (req, res) => {
  try {
    const results = await checkEscalations();
    res.status(200).json({
      success: true,
      message: 'Escalation check completed',
      data: results
    });
  } catch (error) {
    console.error('Check escalations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run escalation check',
      error: error.message
    });
  }
};

/**
 * Get list of escalated complaints for admin dashboard.
 * Ordered by: escalation severity, priority score DESC, oldest first.
 * GET /api/admin/escalations
 */
exports.getEscalations = async (req, res) => {
  try {
    const complaints = await Complaint.find({ escalatedToAdmin: true })
      .populate('citizenId', 'name email')
      .populate('updatedBy', 'name department')
      .populate('progressUpdates.updatedBy', 'name department')
      .populate('adminNotes.addedBy', 'name')
      .lean();

    const now = new Date();
    const withMeta = complaints.map((c) => {
      const lastActivity = getLastOfficialActivity(c);
      const daysSinceLastUpdate = Math.floor((now - lastActivity) / (24 * 60 * 60 * 1000));
      const enriched = enrichComplaint(c);
      return {
        ...enriched,
        daysSinceLastUpdate,
        escalationReason: c.escalationLevel === 'Response Delayed'
          ? 'No response / delay in initial response'
          : c.escalationLevel === 'Resolution Delayed'
            ? 'No progress update for extended period'
            : 'Escalated'
      };
    });

    withMeta.sort((a, b) => {
      const sevA = ESCALATION_ORDER[a.escalationLevel] ?? 0;
      const sevB = ESCALATION_ORDER[b.escalationLevel] ?? 0;
      if (sevB !== sevA) return sevB - sevA;
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    res.status(200).json({
      success: true,
      count: withMeta.length,
      data: { escalations: withMeta }
    });
  } catch (error) {
    console.error('Get escalations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escalations',
      error: error.message
    });
  }
};

/**
 * Add an internal admin note to a complaint.
 * PATCH /api/admin/complaints/:id/note
 * Body: { note: "..." }
 */
exports.addAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!note || !String(note).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.adminNotes = complaint.adminNotes || [];
    complaint.adminNotes.push({
      text: String(note).trim(),
      addedBy: req.user._id,
      addedAt: new Date()
    });
    await complaint.save();
    await complaint.populate('adminNotes.addedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Admin note added',
      data: { complaint: complaint.toObject() }
    });
  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add admin note',
      error: error.message
    });
  }
};

/**
 * Mark complaint as "Follow-up Initiated" by admin.
 * PATCH /api/admin/complaints/:id/follow-up
 */
exports.markFollowUpInitiated = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.followUpInitiatedAt = new Date();
    await complaint.save();
    await complaint.populate('citizenId', 'name email');
    await complaint.populate('updatedBy', 'name department');
    await complaint.populate('progressUpdates.updatedBy', 'name department');
    await complaint.populate('adminNotes.addedBy', 'name');

    const enriched = enrichComplaint(complaint);

    res.status(200).json({
      success: true,
      message: 'Follow-up marked as initiated',
      data: { complaint: enriched }
    });
  } catch (error) {
    console.error('Mark follow-up error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update follow-up status',
      error: error.message
    });
  }
};
