import 'dotenv/config';
import app from './app';

import { AppError } from './utils/AppError';
import { errorHandler } from './middlewares/error';

const port = process.env.PORT ?? 3000;

// Catch all unknown routes
app.use((req, _res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
