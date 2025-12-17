import { RequestHandler } from 'express';
import redisClient from '../redis';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { AppError } from '../utils/AppError';
import { AuthPayload, LoginInput, RegisterInput } from '../types/auth';
import {
    generateAccessToken,
    generateRefreshToken,
    hashToken,
} from '../helpers/generateToken';

const SALT_ROUNDS = 10;

// LOGIN
export const login: RequestHandler = async (req, res) => {
    const { email, password } = req.body as LoginInput;

    // Fetch user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) throw new AppError('Invalid credentials', 401);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    // Create token
    const tokenPayload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);

    res.cookie('refreshToken', refreshToken, {
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY!) * 1000, // in ms
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
        status: 'success',
        data: {
            accessToken,
        },
    });
};

// REGISTER
export const register: RequestHandler = async (req, res) => {
    const { firstName, lastName, email, password, phone } =
        req.body as RegisterInput;

    // Check if user already exists
    const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    if (existing.length > 0) throw new AppError('Email already in use', 409);

    // Hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
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

    const newUserId = result?.id;
    if (!newUserId) {
        throw new AppError('Error creating news', 500);
    }

    const [created] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUserId));

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
            user: {
                id: created.id,
                firstName: created.firstName,
                lastName: created.lastName,
                email: created.email,
                phone: created.phone,
                role: created.role,
            },
        },
    });
};

// GET ALL USERS
export const allUsers: RequestHandler = async (_req, res) => {
    const result = await db
        .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            phone: users.phone,
        })
        .from(users);

    res.json({
        status: 'success',
        message: 'Users fetched successfully',
        data: result,
    });
};

// ***Note: logout and refreshToken works for both auth and adminAuth*** //
// REFRESH TOKEN
export const refreshToken: RequestHandler = async (req, res) => {
    const cookies = req.cookies as { refreshToken?: string };
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError('Refresh token missing', 401);
    }

    // Verify refresh token signature
    let payload: AuthPayload;

    try {
        payload = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET!,
        ) as AuthPayload;
    } catch {
        throw new AppError('Invalid refresh token', 401);
    }

    const userId = payload.id;

    if (!userId) {
        throw new AppError('Invalid refresh token payload', 401);
    }

    // Fetch hashed token from Redis
    const tokenHash = hashToken(refreshToken);
    const redisKey = `refresh:${tokenHash}`;
    const storedUserId = await redisClient.get(redisKey);

    if (!storedUserId) {
        throw new AppError('Refresh token expired or reused', 401);
    }

    // Enforce token ↔ user binding
    if (storedUserId !== String(userId)) {
        await redisClient.del(redisKey);
        throw new AppError('Refresh token mismatch', 401);
    }

    // Rotate refresh token (invalidate old)
    await redisClient.del(redisKey);

    // Create token
    const tokenPayload = { id: userId, role: payload.role };
    const accessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = await generateRefreshToken(tokenPayload);

    res.cookie('refreshToken', newRefreshToken, {
        maxAge: Number(process.env.REFRESH_TOKEN_EXPIRY!) * 1000, // in ms
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
        status: 'success',
        data: {
            accessToken,
        },
    });
};

// LOGOUT
export const logout: RequestHandler = async (req, res) => {
    const cookies = req.cookies as { refreshToken?: string };
    const refreshToken = cookies.refreshToken;

    if (refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await redisClient.del(`refresh:${tokenHash}`);
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
    });

    res.status(204).json({
        status: 'success',
    });
};
