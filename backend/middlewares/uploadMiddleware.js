import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { config } from 'dotenv';
config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'studyvault/notes',
    resource_type: 'raw', // required for .txt and raw .pdf files
  },
});
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default upload;
