import app from './app';
import ENV from './config/env';
import { logger } from './config/logger';
import { connectRedis, disconnectRedis } from './redis';

let server: ReturnType<typeof app.listen>;

async function startServer() {
    try {
        logger.info('Connecting to redis');
        await connectRedis();
        server = app.listen(ENV.PORT, '127.0.0.1'); // For production only
        // server = app.listen(ENV.PORT, () => {
        //     logger.info(`Server running at http://localhost:${ENV.PORT}`);
        // });
    } catch (err) {
        logger.error('Failed to start server', err);
        process.exit(1);
    }
}
startServer();

let isShuttingDown = false;

function shutDown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down gracefully...`);

    // Stop accepting new connections
    server.close(async (err) => {
        if (err) {
            logger.error('Error closing server', err);
            process.exit(1);
        }

        try {
            logger.info('Closing Redis connection');
            await disconnectRedis();
            logger.info('Shutdown complete');
            process.exit(0);
        } catch (err) {
            logger.error('Error during shutdown', err);
            process.exit(1);
        }
    });

    // Force shutdown after timeout
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30_000);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
