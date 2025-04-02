import multer from 'multer';

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Initialize multer for file upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('File is not an image'));
    } else {
      cb(null, true);
    }
  },
});

// Middleware for handling file upload (single image upload)
export const uploadImage = upload.single('image');
