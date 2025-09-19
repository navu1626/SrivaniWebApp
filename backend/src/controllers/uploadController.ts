import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiResponse } from '@/types';
import {
  ValidationError,
  NotFoundError
} from '@/middleware/errorHandler';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
const questionImagesDir = path.join(uploadsDir, 'question-images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(questionImagesDir)) {
  fs.mkdirSync(questionImagesDir, { recursive: true });
}

// Configure multer for question image uploads
const questionImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, questionImagesDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `question-${uniqueSuffix}${extension}`);
  }
});

export const questionImageUpload = multer({
  storage: questionImageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

class UploadController {
  /**
   * Upload profile image
   */
  async uploadProfileImage(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const userId = req.user!.userId;

    // TODO: Implement profile image upload logic
    const response: ApiResponse = {
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        fileId: 'sample-file-id',
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Upload competition banner (admin only)
   */
  async uploadCompetitionBanner(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const userId = req.user!.userId;

    // TODO: Implement competition banner upload logic
    const response: ApiResponse = {
      success: true,
      message: 'Competition banner uploaded successfully',
      data: {
        fileId: 'sample-file-id',
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
      },
    };

    res.status(200).json(response);
  }



  /**
   * Upload questions from Excel (admin only)
   */
  async uploadQuestionsExcel(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    const userId = req.user!.userId;

    // TODO: Implement Excel questions upload logic
    const response: ApiResponse = {
      success: true,
      message: 'Questions Excel file uploaded successfully',
      data: {
        fileId: 'sample-file-id',
        fileName: req.file.filename,
        originalName: req.file.originalname,
        processedQuestions: 0,
        errors: [],
      },
    };

    res.status(200).json(response);
  }

  /**
   * Get uploaded file
   */
  async getFile(req: Request, res: Response): Promise<void> {
    const { fileId } = req.params;

    // TODO: Implement get file logic
    const response: ApiResponse = {
      success: true,
      message: 'File retrieved successfully',
      data: null,
    };

    res.status(200).json(response);
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(req: Request, res: Response): Promise<void> {
    const { fileId } = req.params;
    const userId = req.user!.userId;

    // TODO: Implement delete file logic
    const response: ApiResponse = {
      success: true,
      message: 'File deleted successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Upload question image (admin only)
   */
  async uploadQuestionImage(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new ValidationError('No image file provided');
    }

    try {
      // Generate the URL for the uploaded image
      const imageUrl = `/uploads/question-images/${req.file.filename}`;

      const response: ApiResponse<{ imageUrl: string }> = {
        success: true,
        message: 'Question image uploaded successfully',
        data: {
          imageUrl
        }
      };

      res.status(200).json(response);
    } catch (error) {
      // Clean up uploaded file if there was an error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }
      throw error;
    }
  }

  /**
   * Delete question image (admin only)
   */
  async deleteQuestionImage(req: Request, res: Response): Promise<void> {
    try {
      const { filename } = req.params;

      if (!filename) {
        throw new ValidationError('Filename is required');
      }

      const filePath = path.join(questionImagesDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new ValidationError('Image not found');
      }

      // Delete the file
      fs.unlinkSync(filePath);

      const response: ApiResponse = {
        success: true,
        message: 'Question image deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  }
}

export const uploadController = new UploadController();
