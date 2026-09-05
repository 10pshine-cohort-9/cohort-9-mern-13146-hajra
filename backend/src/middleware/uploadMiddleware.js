const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, 
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed!"));
    }
});


const validateImageContent = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path;
    const buffer = Buffer.alloc(12);

    fs.open(filePath, 'r', (err, fd) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error validating uploaded file." });
        }

        fs.read(fd, buffer, 0, 12, 0, (err, bytesRead) => {
            fs.close(fd, (closeErr) => {
                if (closeErr) console.error("Error closing file descriptor:", closeErr);
            });

            if (err) {
                fs.unlink(filePath, () => {});
                return res.status(500).json({ success: false, message: "Error reading uploaded file." });
            }

            const isJpg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
            const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
            const isWebp = buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';

            if (!isJpg && !isPng && !isWebp) {
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Failed to delete invalid file:", unlinkErr);
                });
                return res.status(400).json({
                    success: false,
                    message: "Invalid file content. Only genuine JPEG, PNG, and WebP images are allowed."
                });
            }

            next();
        });
    });
};

module.exports = {
    upload,
    validateImageContent
};