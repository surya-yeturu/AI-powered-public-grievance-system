const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { registerValidation, loginValidation, validate } = require('../middlewares/validator');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new citizen
 * @access  Public
 */
router.post('/register', registerValidation, validate, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user (citizen or official)
 * @access  Public
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
