import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { AppError } from '../utils/AppError';
import { LoginInput, RegisterInput } from '../types/auth';
import {
    generateAccessToken,
    generateRefreshToken,
} from '../helpers/generateToken';

const SALT_ROUNDS = 10;

// LOGIN
export const adminLogin: RequestHandler = async (req, res) => {
    const { email, password } = req.body as LoginInput;

    // Fetch user
    const [admin] = await db
        .select()
        .from(users)

        .where(eq(users.email, email))
        .limit(1);

    if (!admin || admin.role !== 'admin') {
        throw new AppError('Unauthorized admin access', 403);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    // const isMatch = admin.password == password; // For dev only
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    // Create token
    const tokenPayload = { id: admin.id, role: admin.role };
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

// CREATE
export const createAdmin: RequestHandler = async (req, res) => {
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
            role: 'admin',
        })
        .$returningId();

    const newUserId = result.id;
    const [created] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUserId));

    if (!created) {
        throw new AppError('Error creating admin', 500);
    }

    res.status(201).json({
        status: 'success',
        message: 'Admin created successfully',
    });
};
