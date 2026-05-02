import multer from 'multer';
import path from 'path';

// فقط در حافظه (memory) ذخیره می‌شود تا مستقیماً به Cloudinary برود
const storage = multer.memoryStorage();

// فیلتر نوع فایل
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedImageTypes.test(extname) && mimeType.startsWith('image/')) {
    cb(null, true);
  } else if (allowedVideoTypes.test(extname) && mimeType.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('فقط فرمت‌های تصویر (jpeg, jpg, png, webp) و ویدیو (mp4, mov, avi, mkv) مجاز هستند'), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 مگابایت (برای ویدیو)
  fileFilter,
});