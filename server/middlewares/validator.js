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
    .custom((value) => {
      if (!value) return true;
      // Accept relative path from file upload (e.g. /uploads/xxx.jpg)
      if (value.startsWith('/uploads/')) return true;
      // Accept valid full URLs when pasted
      if (value.startsWith('http://') || value.startsWith('https://')) {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    })
    .withMessage('Image must be an uploaded file path or a valid URL'),
  body('mapLocationUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL().withMessage('Map location URL must be valid')
];

// Status update validation rules (status required; remarks/resolutionRemarks optional)
exports.statusUpdateValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'In Progress', 'Resolved']).withMessage('Invalid status value'),
  body('resolutionRemarks')
    .optional()
    .trim(),
  body('remarks')
    .optional()
    .trim()
];
