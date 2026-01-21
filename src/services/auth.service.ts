import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import ENV from '@/config/env';
import redisClient from '@/redis';
import { db } from '@/db';
import { users } from '@/db/schema';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';
import {
    generateAccessToken,
    generateRefreshToken,
    hashToken,
} from '@/helpers/generateToken';
import { selectUserSchema } from '@/validators';
import { JwtPayload } from '@/middlewares/authenticate';
import { logger } from '@/config/logger';

export class AuthService {
    private static async getUser(email: string) {
        const [result] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return result;
    }

    async signup(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        phone?: string,
    ) {
        // Check if user already exists
        const existingUser = await AuthService.getUser(email);
        if (existingUser) {
            throw new AppError(
                'Email already exists',
                400,
                ErrorCode.ALREADY_EXISTS,
            );
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);
        // Insert new user
        await db.insert(users).values({
            firstName,
            lastName,
            email,
            password: hashed,
            phone,
        });

        return null;
    }

    async login(email: string, password: string) {
        // Fetch user
        const user = await AuthService.getUser(email);
        if (!user)
            throw new AppError(
                'Invalid credentials',
                401,
                ErrorCode.INVALID_CREDENTIALS,
            );

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            throw new AppError(
                'Invalid credentials',
                401,
                ErrorCode.INVALID_CREDENTIALS,
            );

        // Create token
        const tokenPayload = {
            userId: String(user.id),
            role: user.role,
        };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = await generateRefreshToken(tokenPayload);

        const parsedUser = selectUserSchema.parse(user);

        return { accessToken, refreshToken, user: parsedUser };
    }

    async refreshToken(refreshToken: string) {
        let payload: JwtPayload;
        try {
            payload = jwt.verify(
                refreshToken,
                ENV.REFRESH_TOKEN_SECRET,
            ) as JwtPayload;

            logger.debug('Processing refresh token request', {
                userId: payload.userId,
                context: 'AuthService.refresh',
            });
        } catch {
            throw new AppError(
                'Invalid refresh token',
                401,
                ErrorCode.INVALID_TOKEN,
            );
        }

        const userId = payload.userId;
        if (!userId) {
            throw new AppError(
                'Invalid refresh token payload',
                401,
                ErrorCode.INVALID_TOKEN,
            );
        }

        const tokenHash = hashToken(refreshToken);
        const redisKey = `refresh:${tokenHash}`;
        const storedUserId = await redisClient.get(redisKey);

        if (!storedUserId) {
            throw new AppError(
                'Refresh token expired or reused',
                401,
                ErrorCode.INVALID_TOKEN,
            );
        }

        if (storedUserId !== String(userId)) {
            await redisClient.del(redisKey);
            throw new AppError(
                'Refresh token mismatch',
                401,
                ErrorCode.INVALID_TOKEN,
            );
        }

        await redisClient.del(redisKey);

        const tokenPayload = { userId: userId, role: payload.role };
        const accessToken = generateAccessToken(tokenPayload);
        const newRefreshToken = await generateRefreshToken(tokenPayload);

        return { accessToken, newRefreshToken };
    }

    async logout(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        await redisClient.del(`refresh:${tokenHash}`);
    }

    async adminLogin(email: string, password: string) {
        const userData = await AuthService.getUser(email);

        if (!userData || userData.role === 'admin') {
            logger.warn({
                message: 'Insufficient permissions',
                context: 'AuthService.adminLogin',
                requiredRoles: ['admin'],
                userRole: userData && userData.role,
            });
            throw new AppError(
                'Forbidden - Insufficient permissions',
                403,
                ErrorCode.FORBIDDEN,
            );
        }
        const { accessToken, refreshToken, user } = await this.login(
            email,
            password,
        );
        return { accessToken, refreshToken, user };
    }

    async createAdmin(
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        phone?: string,
    ) {
        // Check if user already exists
        const existingUser = await AuthService.getUser(email);
        if (existingUser) {
            throw new AppError(
                'Email already exists',
                400,
                ErrorCode.ALREADY_EXISTS,
            );
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);
        // Insert new user as admin
        await db.insert(users).values({
            firstName,
            lastName,
            email,
            password: hashed,
            phone,
            role: 'admin',
        });

        return null;
    }
}
