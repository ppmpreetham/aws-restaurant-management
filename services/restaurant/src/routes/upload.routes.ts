import { Router, Request, Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const bucketName = process.env.S3_BUCKET;
    if (!bucketName) {
      return res.status(500).json({ error: 'S3_BUCKET environment variable is not configured' });
    }

    const ext = path.extname(file.originalname);
    const filename = `restaurant-images/${uuidv4()}${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // If CloudFront is configured, the domain would be used.
    // For simplicity, we can use the S3 URL format or a generic CDN format.
    // In production, we'd use process.env.CDN_DOMAIN if available.
    const cdnDomain = process.env.CDN_DOMAIN;
    const imageUrl = cdnDomain 
      ? `https://${cdnDomain}/${filename}` 
      : `https://${bucketName}.s3.amazonaws.com/${filename}`;

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
