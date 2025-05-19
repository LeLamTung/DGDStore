import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        const imagePath = path.join("uploads", file.originalname);
        if (fs.existsSync(imagePath)) {
            const ext = path.extname(file.originalname);
            const name = path.basename(file.originalname, ext);
            cb(null, `${name}-${Date.now()}${ext}`);
        } else {
            cb(null, file.originalname);
        }
    },
});

const upload = multer({ storage: storage });

export default upload;
