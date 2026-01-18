import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import ENV from '@/config/env';
import redisClient from '@/redis';
import { AuthPayload } from '@/types/auth';

export const hashToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('hex');

export const generateAccessToken = (user: AuthPayload) => {
    return jwt.sign({ id: user.id, role: user.role }, ENV.ACCESS_TOKEN_SECRET, {
        expiresIn: `${ENV.ACCESS_TOKEN_EXPIRY}s`,
    });
};

export const generateRefreshToken = async (user: AuthPayload) => {
    const token = jwt.sign(
        { id: user.id, role: user.role },
        ENV.REFRESH_TOKEN_SECRET,
        {
            expiresIn: `${ENV.REFRESH_TOKEN_EXPIRY}s`,
        },
    );

    const tokenHash = hashToken(token);

    await redisClient.set(`refresh:${tokenHash}`, String(user.id), {
        expiration: {
            type: 'EX',
            value: ENV.REFRESH_TOKEN_EXPIRY,
        },
    });

    return token;
};
