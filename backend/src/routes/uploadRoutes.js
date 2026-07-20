import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/authMiddleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB file
});

const router = express.Router();

// @desc    Upload an image to Cloudinary
// @route   POST /api/upload
// @access  Private (Registered users only)
router.post('/', protect, upload.single('image'), (req, res, next) => {
  if (!req.file) {
    res.status(400);
    return next(new Error('No image file provided for upload.'));
  }

  // Lazy configuration to ensure dotenv variables are populated (ES Modules hoisting fix)
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload memory buffer to Cloudinary using a write stream
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'curacare' },
    (error, result) => {
      if (error) {
        return next(error);
      }
      res.json({
        success: true,
        url: result.secure_url,
      });
    }
  );

  uploadStream.end(req.file.buffer);
});

export default router;
