const path = require('path');

/**
 * Handle image upload - save file and return URL
 * POST /api/upload
 */
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file.'
      });
    }

    // Return relative URL so frontend can load via same origin (Vite proxy in dev) or BASE_URL in production
    const relativeUrl = `/uploads/${req.file.filename}`;
    const baseUrl = process.env.BASE_URL || '';
    const fileUrl = baseUrl ? `${baseUrl.replace(/\/$/, '')}${relativeUrl}` : relativeUrl;

    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
};
