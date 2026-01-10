import winston from 'winston';

const { combine, timestamp, errors, printf, json, colorize } = winston.format;

const isProd = process.env.NODE_ENV === 'production';

const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    return `${timestamp} [${level}]: ${stack || message} ${
        Object.keys(meta).length ? JSON.stringify(meta) : ''
    }`;
});

const transports: winston.transport[] = [
    new winston.transports.Console({
        format: isProd ? json() : combine(colorize(), devFormat),
    }),
];

if (isProd) {
    transports.push(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
        }),
    );
}

export const logger = winston.createLogger({
    level: isProd ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
    ),
    transports,
    exitOnError: false,
});
