/**
 * Cache Middleware
 * ─────────────────
 * Express middleware that intercepts GET requests and serves
 * cached responses from Redis when available.
 *
 * HIGH COHESION: Only handles request-level cache interception.
 * LOW COUPLING:  Uses cacheService for all Redis operations.
 *
 * Usage:
 *   router.get('/', cacheMiddleware('projects:list'), handler);
 *
 * The cache key is built from the prefix + sorted query string,
 * ensuring deterministic keys regardless of param order.
 */

const { getCache, setCache } = require('../services/cacheService');

/**
 * Creates a caching middleware for a given key prefix.
 * @param {string} prefix  e.g. 'projects:list' or 'projects:detail'
 * @param {number} ttl     cache TTL in seconds (default 600)
 * @returns {Function} Express middleware
 */
function cacheMiddleware(prefix, ttl = 600) {
    return async (req, res, next) => {
        // Build a deterministic cache key from prefix + sorted query params
        const sortedParams = Object.keys(req.query)
            .sort()
            .map(k => `${k}=${req.query[k]}`)
            .join('&');

        const cacheKey = sortedParams ? `${prefix}:${sortedParams}` : prefix;

        try {
            const cached = await getCache(cacheKey);
            if (cached) {
                return res.json(cached);
            }
        } catch (err) {
            // Cache read failed — continue to DB as normal
            console.error('[cacheMiddleware] read error:', err.message);
        }

        // Monkey-patch res.json to intercept the response and cache it
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Cache in the background — don't block the response
            setCache(cacheKey, body, ttl).catch(() => {});
            return originalJson(body);
        };

        next();
    };
}

module.exports = cacheMiddleware;
