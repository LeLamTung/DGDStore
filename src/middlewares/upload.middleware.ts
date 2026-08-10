import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import { Request } from 'express'; // <--- 1. THÊM DÒNG NÀY

// Load biến môi trường
dotenv.config();

// CẤU HÌNH CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
export {cloudinary};
export const getPublicIdFromUrl = (url: string) => {
    try {
        const splitUrl = url.split('/');
        const lastPart = splitUrl.pop(); // Lấy "anh123.jpg"
        const folder = splitUrl.pop();   // Lấy "shop-products"
        const id = lastPart?.split('.')[0]; // Bỏ đuôi .jpg
        return `${folder}/${id}`;
    } catch (error) {
        return null;
    }
};
// CẤU HÌNH STORAGE
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'shop-products',
        
        // 2. SỬA LẠI DÒNG NÀY (Thêm Type cho req và file)
        // Express.Multer.File là kiểu có sẵn khi bạn cài @types/multer
        format: async (req: Request, file: Express.Multer.File) => 'png',
        
        transformation: [
            { width: 1000, crop: "limit" },
            { quality: "auto" },
            { fetch_format: "auto" }
        ]
    } as any
});


// KHỞI TẠO MULTER
const upload = multer({ storage: storage });

export default upload;