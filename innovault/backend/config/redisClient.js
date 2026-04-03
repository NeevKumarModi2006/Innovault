/**
 * Redis Client Configuration
 * ────────────────────────────
 * Initializes a Redis client using the REDIS_URL environment variable.
 * Exports a connected client and a readiness flag.
 *
 * HIGH COHESION: Only manages the Redis connection lifecycle.
 * LOW COUPLING:  Consumers import { redisClient, isReady } without
 *                knowing connection internals.
 *
 * Graceful bypass: If REDIS_URL is not set, the client is null and
 *                  isReady stays false. All consumers must check isReady
 *                  before using the client.
 */

const { createClient } = require('redis');

let redisClient = null;
let isReady = false;

async function initRedis() {
    const url = process.env.REDIS_URL;
    if (!url) {
        console.warn('⚠️  REDIS_URL not set — caching disabled.');
        return;
    }

    try {
        redisClient = createClient({ url });

        redisClient.on('error', (err) => {
            console.error('Redis error:', err.message);
            isReady = false;
        });

        redisClient.on('ready', () => {
            isReady = true;
            console.log('🟢 Redis connected and ready.');
        });

        await redisClient.connect();
    } catch (err) {
        console.error('Redis connection failed:', err.message);
        redisClient = null;
        isReady = false;
    }
}

// Self-initialize on import
initRedis();

module.exports = {
    getClient: () => redisClient,
    getIsReady: () => isReady,
};
