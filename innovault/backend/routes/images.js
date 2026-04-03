/**
 * Image Proxy Route
 * ──────────────────
 * Serves project images through a backend proxy so the raw Cloudinary
 * URL is never exposed to the frontend client.
 *
 * GET /api/images/:identifier
 *
 * When Cloudinary is configured:
 *   - Builds the Cloudinary URL server-side from the stored public_id
 *   - Fetches the image and pipes it to the client with correct headers
 *   - Adds Cache-Control for CDN/browser caching
 *
 * When Cloudinary is NOT configured (local dev):
 *   - Serves from the local ./uploads/ directory as before
 *
 * HIGH COHESION: Only handles image serving.
 * LOW COUPLING:  Doesn't know about projects or reviews.
 *
 * SECURITY: The Cloudinary domain/URL structure is completely hidden
 *           from the client. They only see /api/images/<id>.
 */

const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { cloudinary, isConfigured } = require('../config/cloudinary');

router.get('/:identifier', async (req, res) => {
    const identifier = req.params.identifier;

    // Skip default placeholder
    if (!identifier || identifier === 'default-logo.png') {
        return res.status(404).json({ message: 'No image found.' });
    }

    // ── Cloudinary mode ──────────────────────────────────────
    if (isConfigured) {
        try {
            // Build the Cloudinary URL from the public_id
            // The identifier stored in DB is the Cloudinary public_id
            const imageUrl = cloudinary.url(identifier, {
                secure: true,
                quality: 'auto',
                fetch_format: 'auto',
            });

            // Fetch image from Cloudinary and pipe to client
            const https = require('https');
            const http = require('http');
            const protocol = imageUrl.startsWith('https') ? https : http;

            protocol.get(imageUrl, (imageRes) => {
                if (imageRes.statusCode !== 200) {
                    return res.status(404).json({ message: 'Image not found on cloud.' });
                }

                // Forward content headers
                res.set('Content-Type', imageRes.headers['content-type'] || 'image/jpeg');
                res.set('Cache-Control', 'public, max-age=86400, immutable');
                res.set('X-Content-Type-Options', 'nosniff');

                imageRes.pipe(res);
            }).on('error', (err) => {
                console.error('[images] Cloudinary fetch error:', err.message);
                res.status(500).json({ message: 'Failed to fetch image.' });
            });
        } catch (err) {
            console.error('[images] Proxy error:', err.message);
            res.status(500).json({ message: 'Image proxy error.' });
        }
    }
    // ── Local fallback mode ──────────────────────────────────
    else {
        const filePath = path.join(__dirname, '..', 'uploads', identifier);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Image not found locally.' });
        }

        res.set('Cache-Control', 'public, max-age=3600');
        res.sendFile(filePath);
    }
});

module.exports = router;
