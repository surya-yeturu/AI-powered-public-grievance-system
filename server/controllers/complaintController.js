const Complaint = require('../models/Complaint');
const { classifyComplaint } = require('../services/openaiService');

/**
 * Create a new complaint (Citizen only)
 * POST /api/complaints
 */
exports.createComplaint = async (req, res) => {
  try {
    const { complaintText, imageUrl, location } = req.body;
    const citizenId = req.user._id;

    // Use OpenAI to classify the complaint
    console.log('Classifying complaint with OpenAI...');
    const classification = await classifyComplaint(complaintText);

    // Create complaint with AI classification
    const complaint = new Complaint({
      citizenId,
      complaintText,
      imageUrl: imageUrl || null,
      location,
      department: classification.data.department,
      priority: classification.data.priority,
      priorityReason: classification.data.reason,
      status: 'Pending'
    });

    await complaint.save();

    // Populate citizen details
    await complaint.populate('citizenId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaint,
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
 * GET /api/complaints/my
 */
exports.getMyComplaints = async (req, res) => {
  try {
    const citizenId = req.user._id;

    const complaints = await Complaint.find({ citizenId })
      .sort({ createdAt: -1 }) // Most recent first
      .populate('updatedBy', 'name department');

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: { complaints }
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
 * Get complaints by department (Government Official only)
 * GET /api/complaints/department
 * Query params: ?priority=High&status=Pending
 */
exports.getComplaintsByDepartment = async (req, res) => {
  try {
    const { department } = req.user;
    const { priority, status } = req.query;

    // Build filter
    const filter = { department };
    
    if (priority) {
      filter.priority = priority;
    }
    
    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .sort({ priority: 1, createdAt: -1 }) // High priority first, then recent
      .populate('citizenId', 'name email')
      .populate('updatedBy', 'name');

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: { complaints }
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
 * GET /api/complaints/:id
 */
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id)
      .populate('citizenId', 'name email')
      .populate('updatedBy', 'name department');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check authorization
    // Citizens can only view their own complaints
    if (req.user.role === 'citizen' && complaint.citizenId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Officials can only view complaints from their department
    if (req.user.role === 'official' && complaint.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint is not in your department.'
      });
    }

    res.status(200).json({
      success: true,
      data: { complaint }
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
 * Update complaint status (Government Official only)
 * PATCH /api/complaints/:id/status
 */
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionRemarks } = req.body;
    const officialId = req.user._id;

    // Find complaint
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if official's department matches complaint department
    if (complaint.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This complaint is not in your department.'
      });
    }

    // Update complaint
    complaint.status = status;
    if (resolutionRemarks) {
      complaint.resolutionRemarks = resolutionRemarks;
    }
    complaint.updatedBy = officialId;

    await complaint.save();

    // Populate fields
    await complaint.populate('citizenId', 'name email');
    await complaint.populate('updatedBy', 'name department');

    res.status(200).json({
      success: true,
      message: 'Complaint status updated successfully',
      data: { complaint }
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

    // If official, filter by department
    if (req.user.role === 'official') {
      filter.department = req.user.department;
    }

    // If citizen, filter by citizenId
    if (req.user.role === 'citizen') {
      filter.citizenId = req.user._id;
    }

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
