import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { AppError } from '../utils/AppError';
import { LoginInput, RegisterInput } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = '15d';
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
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES,
    });

    res.status(200).json({
        status: 'success',
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
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

    const newUserId = result.id;
    const [created] = await db
        .select()
        .from(users)
        .where(eq(users.id, newUserId));

    if (!created) {
        throw new AppError('Error creating user', 500);
    }
    // Create token
    const token = jwt.sign({ id: created.id, role: created.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES,
    });

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        token,
        user: {
            id: created.id,
            firstName: created.firstName,
            lastName: created.lastName,
            email: created.email,
            phone: created.phone,
            role: created.role,
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
