import multer from "multer";
// multer dùng để xử lý upload file. (form - data)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
