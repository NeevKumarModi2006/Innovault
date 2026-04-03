/**
 * Upload Middleware
 * ──────────────────
 * Handles file uploads using Multer.
 *
 * When Cloudinary is configured:
 *   - Uses multer-storage-cloudinary to upload directly to Cloudinary
 *   - req.file.filename = Cloudinary public_id (used as DB identifier)
 *
 * When Cloudinary is NOT configured:
 *   - Falls back to local disk storage in ./uploads/
 *   - req.file.filename = timestamped local filename
 *
 * HIGH COHESION: Only handles file upload configuration.
 * LOW COUPLING:  Routes use upload.single('logo') without knowing
 *                whether storage is local or cloud.
 *
 * Constraints:
 *   - Max file size: 5MB
 *   - Allowed types: JPEG, JPG, PNG
 */

const multer = require('multer');
const path = require('path');
const { cloudinary, isConfigured } = require('../config/cloudinary');

let storage;

if (isConfigured) {
    // ── Cloudinary Storage ──────────────────────────────────
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'innovault/logos',        // Cloudinary folder
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [
                { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
            ],
        },
    });
} else {
    // ── Local Disk Storage (fallback) ───────────────────────
    storage = multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        },
    });
}

/**
 * Validate file type — only allow JPEG/JPG/PNG.
 */
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only JPEG, JPG, and PNG images are allowed.'));
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;
