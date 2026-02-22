/**
 * Admin-only routes: escalation check, escalation list, admin note, follow-up.
 * Only users with role 'admin' can access.
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   POST /api/admin/check-escalations
 * @desc    Run escalation check (manual trigger for demo)
 * @access  Private (Admin only)
 */
router.post('/check-escalations', adminController.runCheckEscalations);

/**
 * @route   GET /api/admin/escalations
 * @desc    Get list of escalated complaints for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/escalations', adminController.getEscalations);

/**
 * @route   PATCH /api/admin/complaints/:id/note
 * @desc    Add internal admin note to a complaint
 * @access  Private (Admin only)
 */
router.patch('/complaints/:id/note', adminController.addAdminNote);

/**
 * @route   PATCH /api/admin/complaints/:id/follow-up
 * @desc    Mark complaint as "Follow-up Initiated"
 * @access  Private (Admin only)
 */
router.patch('/complaints/:id/follow-up', adminController.markFollowUpInitiated);

module.exports = router;
