/**
 * Optional multer for progress/completion images on status update.
 * Runs only when Content-Type is multipart/form-data.
 * Max 5 images; jpg, jpeg, png only.
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png'].includes(ext) ? ext : '.jpg';
    cb(null, `progress-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG images are allowed for progress updates.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB per file
});

const MAX_IMAGES = 5;

/**
 * Run multer only when request is multipart; otherwise next().
 * Puts up to 5 files in req.files (field name: images).
 */
function optionalProgressImages(req, res, next) {
  const isMultipart = (req.headers['content-type'] || '').includes('multipart/form-data');
  if (!isMultipart) {
    return next();
  }
  upload.array('images', MAX_IMAGES)(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum size is 5 MB per image.'
        : (err.message || 'Invalid file. Only JPG, PNG allowed.');
      return res.status(400).json({ success: false, message });
    }
    next();
  });
}

module.exports = { optionalProgressImages, MAX_IMAGES };
