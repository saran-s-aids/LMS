const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/covers directory exists
const coversDir = path.join(__dirname, '..', 'uploads', 'covers');
if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (file.fieldname === 'coverImage') {
            cb(null, coversDir);
        } else {
            cb(null, path.join(__dirname, '..', 'uploads'));
        }
    },
    filename(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only! (jpg, jpeg, png, webp, gif)'));
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter(req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
