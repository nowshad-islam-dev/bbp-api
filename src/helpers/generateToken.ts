import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '@/types/auth';
import redisClient from '@/redis';

export const hashToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('hex');

export const generateAccessToken = (user: AuthPayload) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: `${Number(process.env.ACCESS_TOKEN_EXPIRY!)}s`,
        },
    );
};

export const generateRefreshToken = async (user: AuthPayload) => {
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: `${Number(process.env.REFRESH_TOKEN_EXPIRY!)}s`,
        },
    );

    const tokenHash = hashToken(token);

    await redisClient.set(`refresh:${tokenHash}`, String(user.id), {
        expiration: {
            type: 'EX',
            value: Number(process.env.REFRESH_TOKEN_EXPIRY!),
        },
    });

    return token;
};
