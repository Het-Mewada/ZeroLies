import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../utils/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload image to Cloudinary
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await uploadImage(req.file.buffer, 'zerolies');
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;
