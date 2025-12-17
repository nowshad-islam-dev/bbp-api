import 'dotenv/config';
import app from './app';

import { AppError } from './utils/AppError';
import { errorHandler } from './middlewares/error';
import { connectRedis } from './redis';

const port = process.env.PORT ?? 3000;

// Catch all unknown routes
app.use((req, _res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

// Global error handler
app.use(errorHandler);

// Connect to redis when server starts
async function bootstrap() {
    await connectRedis();

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

void bootstrap();
