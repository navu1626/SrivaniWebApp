import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadController, questionImageUpload } from '../controllers/uploadController';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,xlsx,xls').split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

// Routes

// Upload profile image
router.post('/profile-image', upload.single('image'), asyncHandler(uploadController.uploadProfileImage));

// Upload competition banner
router.post('/competition-banner', authMiddleware, adminMiddleware, upload.single('banner'), asyncHandler(uploadController.uploadCompetitionBanner));

// Upload question image - use dedicated storage that saves under /uploads/question-images
// (Removed generic upload.single to avoid saving in wrong folder)


// Upload questions from Excel
router.post('/questions-excel', authMiddleware, adminMiddleware, upload.single('excel'), asyncHandler(uploadController.uploadQuestionsExcel));

// Get uploaded file
router.get('/file/:fileId', asyncHandler(uploadController.getFile));

// Delete uploaded file
router.delete('/file/:fileId', asyncHandler(uploadController.deleteFile));

// Question image upload (admin only)
router.post('/question-image',
  authMiddleware,
  adminMiddleware,
  questionImageUpload.single('image'),
  asyncHandler(uploadController.uploadQuestionImage)
);

// Delete question image (admin only)
router.delete('/question-image/:filename',
  authMiddleware,
  adminMiddleware,
  asyncHandler(uploadController.deleteQuestionImage)
);

export default router;
