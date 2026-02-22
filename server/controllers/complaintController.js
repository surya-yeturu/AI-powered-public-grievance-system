const Complaint = require('../models/Complaint');
const { classifyComplaint } = require('../services/openaiService');
const { calculatePriorityScore, enrichComplaint, sortByPriorityScore } = require('../services/priorityScoreService');
const { generateDailyPlan, getComplaintIdsInTodayPlan } = require('../services/dailyPlanService');

/**
 * Create a new complaint (Citizen only)
 * Hybrid AI + rules → basePriority, then dynamic score calculated.
 * POST /api/complaints
 */
exports.createComplaint = async (req, res) => {
  try {
    const { complaintText, imageUrl, location, mapLocationUrl } = req.body;
    const citizenId = req.user._id;

    console.log('Classifying complaint with OpenAI...');
    const classification = await classifyComplaint(complaintText, location);
    const d = classification.data;

    const complaint = new Complaint({
      citizenId,
      complaintText,
      imageUrl: imageUrl || null,
      location,
      mapLocationUrl: mapLocationUrl || null,
      department: d.department,
      basePriority: d.basePriority,
      priority: d.basePriority,
      priorityReason: d.reason,
      escalatedByRules: d.escalatedByRules || false,
      sensitiveLocation: d.sensitiveLocation || false,
      status: 'Pending'
    });

    const initialScore = calculatePriorityScore(complaint);
    complaint.priorityScore = initialScore.priorityScore;
    complaint.lastScoreUpdatedAt = new Date();

    await complaint.save();
    await complaint.populate('citizenId', 'name email');

    const enriched = enrichComplaint(complaint);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint: enriched,
        aiClassification: {
          success: classification.success,
          note: !classification.success ? 'AI classification failed, using defaults' : 'AI classification successful'
        }
      }
    });

  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
};

/**
 * Get all complaints for logged-in citizen
 * Recalculate priority score; order by score DESC, createdAt ASC.
 * GET /api/complaints/my
 */
exports.getMyComplaints = async (req, res) => {
  try {
    const citizenId = req.user._id;

    const complaints = await Complaint.find({ citizenId })
      .populate('updatedBy', 'name department');

    const enriched = sortByPriorityScore(complaints);

    // Citizen transparency: mark complaints that are in today's plan for their department
    const departments = [...new Set(enriched.map((c) => c.department))];
    const planIdsByDept = {};
    for (const dept of departments) {
      planIdsByDept[dept] = await getComplaintIdsInTodayPlan(dept);
    }
    enriched.forEach((c) => {
      c.inTodayPlan = planIdsByDept[c.department]?.has(c._id.toString()) ?? false;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: { complaints: enriched }
    });

  } catch (error) {
    console.error('Get my complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

/**
 * Get today's recommended work plan for the official's department (or specified department for admin).
 * GET /api/complaints/daily-plan?date=YYYY-MM-DD&department=Roads (admin only for department)
 */
exports.getDailyPlan = async (req, res) => {
  try {
    const { date, department: queryDept } = req.query;
    const department = req.user.role === 'admin' && queryDept
      ? queryDept
      : req.user.department;
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required. Officials use their assigned department; admin may pass ?department=.'
      });
    }
    const plan = await generateDailyPlan(department, date || null);
    res.status(200).json({
      success: true,
      data: { plan }
    });
  } catch (error) {
    console.error('Get daily plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily plan',
      error: error.message
    });
  }
};

/**
 * Get complaints by department (Official) or all (Admin)
 * Ordered by FinalPriorityScore DESC, createdAt ASC. Includes execution rank.
 * Query params: ?basePriority=High&priority=High&status=Pending&department=Roads
 */
exports.getComplaintsByDepartment = async (req, res) => {
  try {
    const { basePriority, priority, status, department: queryDept } = req.query;

    const filter = {};
    if (req.user.role === 'admin') {
      if (queryDept) filter.department = queryDept;
    } else {
      filter.department = req.user.department;
    }

    const priorityFilter = basePriority || priority;
    if (priorityFilter) {
      filter.$or = [
        { basePriority: priorityFilter },
        { priority: priorityFilter }
      ];
    }
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name email')
      .populate('updatedBy', 'name');

    const enriched = sortByPriorityScore(complaints);
    const withRank = enriched.map((c, i) => ({ ...c, executionRank: i + 1 }));

    res.status(200).json({
      success: true,
      count: withRank.length,
      data: { complaints: withRank }
    });

  } catch (error) {
    console.error('Get department complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
      error: error.message
    });
  }
};

/**
 * Get single complaint by ID
 * Recalculates priority score and returns with explanation.
 * GET /api/complaints/:id
 */
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id)
      .populate('citizenId', 'name email')
      .populate('updatedBy', 'name department')
      .populate('progressUpdates.updatedBy', 'name department')
      .populate('adminNotes.addedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (req.user.role === 'citizen' && complaint.citizenId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'official' && complaint.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint is not in your department.'
      });
    }

    let enriched = enrichComplaint(complaint);
    if (req.user.role === 'citizen' && enriched.adminNotes) {
      enriched = { ...enriched, adminNotes: undefined };
    }

    res.status(200).json({
      success: true,
      data: { complaint: enriched }
    });

  } catch (error) {
    console.error('Get complaint by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
      error: error.message
    });
  }
};

/**
 * Update complaint status (Official/Admin). Supports optional progress/completion images via multipart.
 * PATCH /api/complaints/:id/status
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionRemarks, remarks } = req.body;
    const officialId = req.user._id;
    const files = req.files || [];

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (req.user.role !== 'admin' && complaint.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint is not in your department.'
      });
    }

    // Status can only move forward: Pending → In Progress → Resolved (no going back to Pending)
    const currentStatus = complaint.status;
    if (status === 'Pending' && (currentStatus === 'In Progress' || currentStatus === 'Resolved')) {
      return res.status(400).json({
        success: false,
        message: 'Status cannot be set back to Pending once the complaint is In Progress or Resolved.'
      });
    }
    if (currentStatus === 'Resolved' && status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Resolved complaints cannot be changed to another status.'
      });
    }

    const remarksText = (remarks && remarks.trim()) || (resolutionRemarks && resolutionRemarks.trim()) || '';

    complaint.status = status;
    if (remarksText) complaint.resolutionRemarks = remarksText;
    complaint.updatedBy = officialId;
    complaint.lastOfficialUpdateAt = new Date();

    if (!complaint.progressUpdates) complaint.progressUpdates = [];

    if (status === 'In Progress' || status === 'Resolved') {
      const imageUrls = files.map((f) => `/uploads/${f.filename}`);
      complaint.progressUpdates.push({
        status,
        images: imageUrls,
        remarks: remarksText,
        updatedBy: officialId,
        updatedAt: new Date()
      });
    }

    const recalc = calculatePriorityScore(complaint);
    complaint.priorityScore = recalc.priorityScore;
    complaint.lastScoreUpdatedAt = new Date();

    await complaint.save();
    await complaint.populate('citizenId', 'name email');
    await complaint.populate('updatedBy', 'name department');
    await complaint.populate('progressUpdates.updatedBy', 'name department');

    const enriched = enrichComplaint(complaint);

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: { complaint: enriched }
    });

  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint status',
      error: error.message
    });
  }
};

/**
 * Get complaint statistics (for dashboard)
 * GET /api/complaints/stats
 */
exports.getComplaintStats = async (req, res) => {
  try {
    let filter = {};

    // Admin: no filter (all complaints). Official: by department. Citizen: by citizenId
    if (req.user.role === 'official') {
      filter.department = req.user.department;
    } else if (req.user.role === 'citizen') {
      filter.citizenId = req.user._id;
    }
    // admin: filter stays {}

    const stats = await Complaint.aggregate([
      { $match: filter },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats[0],
        total: stats[0].total[0]?.count || 0
      }
    });

  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
