import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL!,
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis socket connected');
});

redisClient.on('ready', () => {
    console.log('Redis client ready');
});

export async function connectRedis() {
    try {
        await redisClient.connect();
        const pong = await redisClient.ping();
        if (pong !== 'PONG') {
            throw new Error(`Unexpected Redis PING response: ${pong}`);
        }

        console.log('Redis connection verified');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
        process.exit(1);
    }
}

export async function disconnectRedis() {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
}

export default redisClient;
