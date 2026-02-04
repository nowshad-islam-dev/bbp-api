import 'dotenv/config';
import * as z from 'zod';

const envSchema = z.object({
    APP_NAME:
        process.env.NODE_ENV === 'development'
            ? z.string().optional().default('Express API')
            : z.string(),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_URL: z.url(),
    REDIS_URL: z.url(),
    SERVER_URL: z.url(),
    FRONTEND_URL: z.url(),
    ACCESS_TOKEN_SECRET: z.string().min(32),
    ACCESS_TOKEN_EXPIRY: z.coerce.number(),
    REFRESH_TOKEN_SECRET: z.string().min(32),
    REFRESH_TOKEN_EXPIRY: z.coerce.number(),
    IMAGEKIT_PUBLIC_KEY: z.string().startsWith('public'),
    IMAGEKIT_PRIVATE_KEY: z.string().startsWith('private'),
    IMAGEKIT_URL_ENDPOINT: z.url(),
    EMAIL_VERIFICATION_TOKEN_EXPIRY: z.coerce.number(),
    SMTP_HOST:
        process.env.NODE_ENV === 'development'
            ? z.string().optional()
            : z.string(),
    SMTP_PORT:
        process.env.NODE_ENV === 'development'
            ? z.string().transform(Number).optional()
            : z.string().transform(Number),
    SMTP_USER:
        process.env.NODE_ENV === 'development'
            ? z.string().optional()
            : z.string(),
    SMTP_PASSWORD:
        process.env.NODE_ENV === 'development'
            ? z.string().optional()
            : z.string(),
    SMTP_FROM:
        process.env.NODE_ENV === 'development'
            ? z.email().optional()
            : z.email(),
});

type Env = z.infer<typeof envSchema>;

let ENV: Env;

try {
    ENV = envSchema.parse(process.env);
} catch (err) {
    console.error('❌ Invalid env!');
    const error = (err as z.ZodError).flatten().fieldErrors;
    console.error(error);
    process.exit(1);
}

export default ENV;
