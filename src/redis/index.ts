import { createClient } from 'redis';
import ENV from '@/config/env';
import { logger } from '@/config/logger';

const redisClient = createClient({
    url: ENV.REDIS_URL,
});

redisClient.on('error', (err) => {
    logger.error('Redis error:', err);
});

redisClient.on('connect', () => {
    logger.info('Redis socket connected');
});

redisClient.on('ready', () => {
    logger.info('Redis client ready');
});

export async function connectRedis() {
    try {
        await redisClient.connect();
        const pong = await redisClient.ping();
        if (pong !== 'PONG') {
            throw new Error(`Unexpected Redis PING response: ${pong}`);
        }

        logger.info('Redis connection verified');
    } catch (err) {
        logger.error('Failed to connect to Redis:', err);
        process.exit(1);
    }
}

export async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}

export default redisClient;
