// src/routes/upload.ts
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getDatabase } from '../config/database';
import { authenticateJWT } from '../middleware/auth';
import { logger } from '../config/logger';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
const initializeUploadsDir = async () => {
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    logger.info('Created uploads directory');
  }
};

// Initialize uploads directory
initializeUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await initializeUploadsDir();
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for image uploads
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload avatar
router.post('/avatar', authenticateJWT, upload.single('avatar'), async (req, res) => {
  const db = getDatabase();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user.id;
    const originalPath = req.file.path;
    const filename = req.file.filename;
    
    // Process image with sharp
    const processedFilename = `processed-${filename}`;
    const processedPath = path.join(uploadsDir, processedFilename);
    
    await sharp(originalPath)
      .resize(200, 200, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(processedPath);
    
    // Delete original file
    await fs.unlink(originalPath);
    
    // Update user avatar URL in database
    const avatarUrl = `/uploads/${processedFilename}`;
    
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        username: true,
        avatar: true,
      }
    });

    logger.info(`Avatar updated for user ${userId}`);
    
    return res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl,
      user: updatedUser
    });
    
  } catch (error) {
    logger.error('Avatar upload error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Error cleaning up file:', unlinkError);
      }
    }
    
    return res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload idea images
router.post('/idea-images', authenticateJWT, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const processedImages = [];
    
    for (const file of req.files) {
      const originalPath = file.path;
      const filename = file.filename;
      
      // Process image with sharp
      const processedFilename = `processed-${filename}`;
      const processedPath = path.join(uploadsDir, processedFilename);
      
      await sharp(originalPath)
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(processedPath);
      
      // Delete original file
      await fs.unlink(originalPath);
      
      const imageUrl = `/uploads/${processedFilename}`;
      processedImages.push({
        url: imageUrl,
        filename: processedFilename,
        originalName: file.originalname
      });
    }

    logger.info(`Processed ${processedImages.length} idea images`);
    
    return res.json({
      message: 'Images uploaded successfully',
      images: processedImages
    });
    
  } catch (error) {
    logger.error('Idea images upload error:', error);
    
    // Clean up files if they exist
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.error('Error cleaning up file:', unlinkError);
        }
      }
    }
    
    return res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Delete uploaded file
router.delete('/file/:filename', authenticateJWT, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Security check: ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete file
    await fs.unlink(filePath);
    
    logger.info(`File deleted: ${filename}`);
    
    return res.json({ message: 'File deleted successfully' });
    
  } catch (error) {
    logger.error('File deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get upload info/limits
router.get('/info', authenticateJWT, (_req, res) => {
  res.json({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5,
    supportedFormats: {
      avatar: {
        maxSize: '10MB',
        dimensions: '200x200 (auto-cropped)',
        formats: ['JPEG', 'PNG', 'GIF', 'WebP']
      },
      ideaImages: {
        maxSize: '10MB per image',
        maxFiles: 5,
        maxDimensions: '800x600 (auto-resized)',
        formats: ['JPEG', 'PNG', 'GIF', 'WebP']
      }
    }
  });
});

// Error handling middleware for multer
router.use((error: any, _req: any, res: any, _next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 5 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  
  logger.error('Upload middleware error:', error);
  res.status(500).json({ error: 'Upload failed' });
});

export default router;
