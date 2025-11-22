import express from 'express';
import cors from 'cors';
import compression from 'compression';

const app = express();

// Middlewares (packages + built ins)
const allowed = ['http://localhost:5000'];
const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowed.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());

// Routes
import authRouter from './routes/auth';

app.use('/api/auth', authRouter);

export default app;
