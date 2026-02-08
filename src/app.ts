import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ENV from './config/env';
import { setupSecurityHeaders } from './middlewares/securityHeader';
import { requestId } from './middlewares/requestId';
import { compressionMiddleware } from './middlewares/performance';
import { loggingMiddleware } from './middlewares/loggingMiddleware';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';
import { rateLimiterMiddleware } from './middlewares/globalRateLimiter';
import { cache } from './middlewares/cache';

const app = express();

const setupMiddleware = (app: express.Application) => {
    app.use(requestId);
    setupSecurityHeaders(app as express.Express);
    app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
    app.use(compressionMiddleware);
    app.use(express.json({ limit: '24kb' }));
    app.use(cookieParser());
    app.use(loggingMiddleware);

    // Global Rate limiting
    app.use('/api', rateLimiterMiddleware);
};

setupMiddleware(app);

if (ENV.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust the first hop(Nginx)
}
// For browser requesting favicon
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Routes
import authRouter from './routes/auth.route';
import newsRouter from './routes/news.route';
import eventsRouter from './routes/events.route';
import candidatesRouter from './routes/candidates.route';
import commentsRouter from './routes/comments.route';
import usersRouter from './routes/users.route';

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/news', newsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/candidates', candidatesRouter);
app.use('/api/comments', commentsRouter);

// Cache middleware
app.use('/api/news', cache({ duration: 300 }));
app.use('/api/events', cache({ duration: 300 }));
app.use('/api/candidates', cache({ duration: 300 }));

// Health Check
app.get('/health-check', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
    });
});

// Catch all unknown routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
