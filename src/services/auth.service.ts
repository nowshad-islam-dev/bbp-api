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
    generateEmailVerificationToken,
    generateRefreshToken,
    hashToken,
} from '@/helpers/generateToken';
import { selectUserSchema } from '@/validators';
import { JwtPayload } from '@/middlewares/authenticate';
import { logger } from '@/config/logger';
import { EmailService } from './email.service';

export class AuthService {
    private emailService: EmailService;
    constructor() {
        this.emailService = new EmailService();
    }
    private static async getUser(email: string) {
        const [result] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        return result;
    }

    async verifyEmail(token: string) {
        const hashedToken = hashToken(token);
        const redisKey = `email_verify:${hashedToken}`;
        const userId = await redisClient.get(redisKey);

        if (!userId) {
            throw new AppError(
                'Invalid verification token',
                400,
                ErrorCode.INVALID_TOKEN,
            );
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, Number(userId)));

        if (!user) {
            throw new AppError(
                'Invalid verification token',
                400,
                ErrorCode.INVALID_TOKEN,
            );
        }

        await db
            .update(users)
            .set({ emailVerified: true, emailVerifiedAt: new Date() });
        return { result: null, message: 'Email verified successfully' };
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
        const [result] = await db
            .insert(users)
            .values({
                firstName,
                lastName,
                email,
                password: hashed,
                phone,
            })
            .$returningId();

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, result.id));

        const verificationToken = await generateEmailVerificationToken(
            String(user.id),
        );

        await this.emailService.sendVerificationEmail(
            user.email,
            user.firstName,
            verificationToken,
        );

        return { result: null };
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

        return { result: { accessToken, refreshToken, user: parsedUser } };
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

        return { result: { accessToken, newRefreshToken } };
    }

    async logout(refreshToken: string) {
        const tokenHash = hashToken(refreshToken);
        await redisClient.del(`refresh:${tokenHash}`);
    }

    async adminLogin(email: string, password: string) {
        const userData = await AuthService.getUser(email);

        if (!userData || userData.role !== 'admin') {
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
        const { result } = await this.login(email, password);
        const { accessToken, refreshToken, user } = result;
        return { result: { accessToken, refreshToken, user } };
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

        return { result: null };
    }
}
