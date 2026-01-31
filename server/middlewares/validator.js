const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Registration validation rules
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Login validation rules
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Complaint validation rules
exports.complaintValidation = [
  body('complaintText')
    .trim()
    .notEmpty().withMessage('Complaint text is required')
    .isLength({ min: 10 }).withMessage('Complaint must be at least 10 characters'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required'),
  body('imageUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL().withMessage('Image URL must be valid')
];

// Status update validation rules
exports.statusUpdateValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'In Progress', 'Resolved']).withMessage('Invalid status value'),
  body('resolutionRemarks')
    .optional()
    .trim()
];
