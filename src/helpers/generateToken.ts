import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import ENV from '@/config/env';
import redisClient from '@/redis';
import { JwtPayload } from '@/middlewares/authenticate';

export const hashToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('hex');

export const generateAccessToken = (user: JwtPayload) => {
    return jwt.sign(
        { userId: user.userId, role: user.role },
        ENV.ACCESS_TOKEN_SECRET,
        {
            expiresIn: `${ENV.ACCESS_TOKEN_EXPIRY}s`,
        },
    );
};

export const generateRefreshToken = async (user: JwtPayload) => {
    const token = jwt.sign(
        { userId: user.userId, role: user.role },
        ENV.REFRESH_TOKEN_SECRET,
        {
            expiresIn: `${ENV.REFRESH_TOKEN_EXPIRY}s`,
        },
    );

    const tokenHash = hashToken(token);
    await redisClient.set(`refresh:${tokenHash}`, String(user.userId), {
        expiration: {
            type: 'EX',
            value: ENV.REFRESH_TOKEN_EXPIRY,
        },
    });
    return token;
};

export const generateEmailVerificationToken = async (userId: string) => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);

    await redisClient.set(`email_verify:${hashedToken}`, userId, {
        expiration: {
            type: 'EX',
            value: ENV.EMAIL_VERIFICATION_TOKEN_EXPIRY,
        },
    });
    return rawToken;
};
