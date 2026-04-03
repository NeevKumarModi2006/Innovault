/**
 * Cache Service
 * ──────────────
 * Provides a high-level API for caching data in Redis.
 * All functions are no-ops when Redis is unavailable.
 *
 * HIGH COHESION: Only handles cache read/write/clear.
 * LOW COUPLING:  Routes call getCache/setCache without knowing
 *                Redis internals. The redis config module is the
 *                single source of truth for the connection.
 *
 * Functions:
 *   getCache(key)                → cached JSON or null
 *   setCache(key, data, ttl)     → stores JSON with TTL
 *   clearCacheByPrefix(prefix)   → deletes all keys matching prefix*
 *   incrementLoginAttempts(key)  → increments failed login attempts
 *   getLoginAttempts(key)        → returns current failed login attempts
 *   clearLoginAttempts(key)      → resets failed login attempts
 */

const redis = require('../config/redisClient');

const DEFAULT_TTL = 600; // 10 minutes

/**
 * Retrieve cached data by key.
 * @param {string} key
 * @returns {object|null} parsed JSON or null
 */
async function getCache(key) {
    if (!redis.getIsReady()) return null;
    try {
        const data = await redis.getClient().get(key);
        if (data) {
            console.log(`[cache] HIT  → ${key}`);
            return JSON.parse(data);
        }
        console.log(`[cache] MISS → ${key}`);
        return null;
    } catch (err) {
        console.error('[cache] getCache error:', err.message);
        return null;
    }
}

/**
 * Store data in cache with a TTL.
 * @param {string} key
 * @param {object} data
 * @param {number} ttl  seconds (default 600)
 */
async function setCache(key, data, ttl = DEFAULT_TTL) {
    if (!redis.getIsReady()) return;
    try {
        await redis.getClient().set(key, JSON.stringify(data), { EX: ttl });
        console.log(`[cache] SET  → ${key} (TTL ${ttl}s)`);
    } catch (err) {
        console.error('[cache] setCache error:', err.message);
    }
}

/**
 * Clear all cached keys matching a prefix pattern.
 * Uses SCAN to find matching keys (safe for production).
 * @param {string} prefix  e.g. 'projects:'
 */
async function clearCacheByPrefix(prefix) {
    if (!redis.getIsReady()) return;
    try {
        const client = redis.getClient();
        let cursor = '0';
        let deletedCount = 0;

        do {
            const result = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
            cursor = String(result.cursor);
            const keys = result.keys;

            if (keys.length > 0) {
                await client.del(keys);
                deletedCount += keys.length;
            }
        } while (cursor !== '0');

        if (deletedCount > 0) {
            console.log(`[cache] CLEAR → ${prefix}* (${deletedCount} keys)`);
        }
    } catch (err) {
        console.error('[cache] clearCacheByPrefix error:', err.message);
    }
}

/**
 * Increment failed login attempts for a specific email.
 * Locks the record with a 15-minute TTL (900 seconds).
 */
async function incrementLoginAttempts(email) {
    if (!redis.getIsReady()) return 0;
    try {
        const key = `login_attempts:${email}`;
        const count = await redis.getClient().incr(key);
        if (count === 1) {
            // Set expiration only on the first failure
            await redis.getClient().expire(key, 900);
        }
        return count;
    } catch (err) {
        console.error('[cache] incrementLoginAttempts error:', err.message);
        return 0;
    }
}

/**
 * Retrieve current failed login attempts for a given email.
 */
async function getLoginAttempts(email) {
    if (!redis.getIsReady()) return 0;
    try {
        const key = `login_attempts:${email}`;
        const count = await redis.getClient().get(key);
        return count ? parseInt(count) : 0;
    } catch (err) {
        console.error('[cache] getLoginAttempts error:', err.message);
        return 0;
    }
}

/**
 * Clear failed login attempts upon successful login.
 */
async function clearLoginAttempts(email) {
    if (!redis.getIsReady()) return;
    try {
        const key = `login_attempts:${email}`;
        await redis.getClient().del(key);
    } catch (err) {
        console.error('[cache] clearLoginAttempts error:', err.message);
    }
}

module.exports = { 
    getCache, 
    setCache, 
    clearCacheByPrefix, 
    incrementLoginAttempts, 
    getLoginAttempts, 
    clearLoginAttempts 
};
