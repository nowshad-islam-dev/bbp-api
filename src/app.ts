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

const app = express();

const setupMiddleware = (app: express.Application) => {
    app.use(requestId);
    setupSecurityHeaders(app as express.Express);
    app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
    app.use(compressionMiddleware);
    app.use(express.json({ limit: '24kb' }));
    app.use(cookieParser());
    app.use(loggingMiddleware);
};

setupMiddleware(app);

// Routes
import authRouter from './routes/auth.route';
// import adminAuthRouter from './routes/adminAuth';
// import newsRouter from './routes/news';
// import eventsRouter from './routes/events';
// import candidatesRouter from './routes/candidates';
// import commentsRouter from './routes/comments';

app.use('/api/auth', authRouter);
// app.use('/api/admin/auth', adminAuthRouter);
// app.use('/api/news', newsRouter);
// app.use('/api/events', eventsRouter);
// app.use('/api/candidates', candidatesRouter);
// app.use('/api/comments', commentsRouter);

// Catch all unknown routes
app.use(notFoundHandler);

// Global error handler

// const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
//     return errorHandler(err, req, res, next);
// };

app.use(errorHandler);

export default app;
