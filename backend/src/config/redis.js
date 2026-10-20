const { createClient } = require("redis");
const logger = require("./logger");

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                logger.warn("Redis: Max reconnect attempts reached. Continuing without cache.");
                return false; // Stop reconnecting after 5 tries
            }
            return Math.min(retries * 200, 2000); // Exponential backoff
        },
    },
});

redisClient.on("connect", () => logger.info("Redis connected successfully"));
redisClient.on("error", (err) => logger.warn(`Redis Warning: ${err.message}`));

async function connectRedis() {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        logger.warn(`Redis could not connect on startup: ${err.message}. App will use MongoDB directly.`);
    }
}

// ---------------- Helper Functions ---------------- //
// 1. getCache(key) — Reading from RAM
/** Get cached JSON object */
async function getCache(key) {
    try {
        if (!redisClient.isOpen) return null;
        const data = await redisClient.get(key);

        if (data) {
            // ⚡ CACHE HIT LOG
            logger.info(`⚡ [REDIS HIT] Serving from cache: ${key}`);
            return JSON.parse(data);
        }

        // 🐢 CACHE MISS LOG
        logger.info(`🐢 [REDIS MISS] Not in cache, fetching from DB: ${key}`);
        return null;
    } catch (err) {
        logger.warn(`Redis getCache error for key "${key}": ${err.message}`);
        return null;
    }
}

// 2. setCache(key, value, ttlSeconds = 300) — Writing to RAM
/** Set JSON object in cache with expiration in seconds */
async function setCache(key, value, ttlSeconds = 300) {
    try {
        if (!redisClient.isOpen) return;
        await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
        // 💾 CACHE SET LOG
        logger.info(`💾 [REDIS SET] Cached key: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (err) {
        logger.warn(`Redis setCache error for key "${key}": ${err.message}`);
    }
}

//clearCachePattern(pattern) — Bulk Deleting (Cache Invalidation)
/** Clear all keys matching a pattern (e.g. "listings:*") */
async function clearCachePattern(pattern) {
    try {
        if (!redisClient.isOpen) return;
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            logger.info(`Redis: Cleared ${keys.length} keys matching "${pattern}"`);
        }
    } catch (err) {
        logger.warn(`Redis clearCachePattern error for "${pattern}": ${err.message}`);
    }
}

module.exports = {
    redisClient,
    connectRedis,
    getCache,
    setCache,
    clearCachePattern,
};
