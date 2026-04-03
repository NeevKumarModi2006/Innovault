/**
 * Cloudinary Configuration Module
 * ─────────────────────────────────
 * Initializes the Cloudinary v2 SDK using environment variables.
 * Exports the configured instance for use in upload middleware.
 *
 * HIGH COHESION: This module is solely responsible for Cloudinary setup.
 * LOW COUPLING:  Other modules import the configured instance without
 *                knowing internal config details.
 *
 * Graceful bypass: If credentials are missing, logs a warning.
 *                  The upload middleware will fall back to local disk.
 */

const cloudinary = require('cloudinary').v2;

const isConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('☁️  Cloudinary configured successfully.');
} else {
    console.warn('⚠️  Cloudinary credentials missing — falling back to local disk storage.');
}

module.exports = { cloudinary, isConfigured };
