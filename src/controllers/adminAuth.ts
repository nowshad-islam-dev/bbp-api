import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { AppError } from '../utils/AppError';
import { LoginInput, RegisterInput } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = '15d';
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
    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES,
    });

    res.status(200).json({
        status: 'success',
        data: {
            token,
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
    // Create token
    const token = jwt.sign({ id: created.id, role: created.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES,
    });

    res.status(201).json({
        status: 'success',
        message: 'Admin created successfully',
        data: {
            token,
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
