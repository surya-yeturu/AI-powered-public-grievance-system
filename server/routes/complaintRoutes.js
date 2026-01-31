const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middlewares/auth');
const { complaintValidation, statusUpdateValidation, validate } = require('../middlewares/validator');

/**
 * @route   POST /api/complaints
 * @desc    Create a new complaint
 * @access  Private (Citizen only)
 */
router.post(
  '/',
  authenticate,
  authorize('citizen'),
  complaintValidation,
  validate,
  complaintController.createComplaint
);

/**
 * @route   GET /api/complaints/my
 * @desc    Get all complaints for logged-in citizen
 * @access  Private (Citizen only)
 */
router.get(
  '/my',
  authenticate,
  authorize('citizen'),
  complaintController.getMyComplaints
);

/**
 * @route   GET /api/complaints/department
 * @desc    Get complaints by department (official) or all (admin)
 * @access  Private (Official or Admin)
 */
router.get(
  '/department',
  authenticate,
  authorize('official', 'admin'),
  complaintController.getComplaintsByDepartment
);

/**
 * @route   GET /api/complaints/stats
 * @desc    Get complaint statistics
 * @access  Private
 */
router.get(
  '/stats',
  authenticate,
  complaintController.getComplaintStats
);

/**
 * @route   GET /api/complaints/:id
 * @desc    Get single complaint by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  complaintController.getComplaintById
);

/**
 * @route   PATCH /api/complaints/:id/status
 * @desc    Update complaint status
 * @access  Private (Official only)
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('official'),
  statusUpdateValidation,
  validate,
  complaintController.updateComplaintStatus
);

module.exports = router;
