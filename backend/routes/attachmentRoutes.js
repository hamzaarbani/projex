const express = require('express');
const multer = require('multer');
const path = require('path');
const protect = require('../middleware/auth');
const { uploadAttachment, getAttachments, deleteAttachment } = require('../controllers/attachmentController');

const router = express.Router();

// ✅ Local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// ✅ Route must include upload.single('file') middleware
router.post('/:taskId', protect, upload.single('file'), uploadAttachment);
router.get('/:taskId', protect, getAttachments);
router.delete('/:id', protect, deleteAttachment);

module.exports = router;