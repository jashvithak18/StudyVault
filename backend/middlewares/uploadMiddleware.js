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
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isRaw = ['txt', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext);
    const cleanName = file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
    
    if (isRaw) {
      return {
        folder: 'studyvault/notes',
        resource_type: 'raw',
        public_id: `${cleanName}-${Date.now()}.${ext}`,
      };
    } else {
      return {
        folder: 'studyvault/notes',
        resource_type: 'auto',
        format: ext,
        public_id: `${cleanName}-${Date.now()}`,
      };
    }
  },
});
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default upload;
