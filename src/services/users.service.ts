import bcrypt from 'bcrypt';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';

export type Role = 'volunteer' | 'user' | 'admin';

export class UserService {
    async getAll(page = '1', pageSize = '20', role = 'user') {
        const safePageSize = Math.min(Math.max(parseInt(pageSize), 1), 20);
        const safePage = Math.max(parseInt(page), 1);
        const offset = (safePage - 1) * safePageSize;

        // Count query
        const [totalResult] = await db
            .select({ value: count() })
            .from(users)
            .where(eq(users.role, role as Role));

        const totalItems = Number(totalResult.value);

        // Paginated data query
        const result = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                phone: users.phone,
            })
            .from(users)
            .where(eq(users.role, role as Role))
            .orderBy(users.id)
            .limit(safePageSize)
            .offset(offset);

        const totalPages = Math.ceil(totalItems / safePageSize);

        return {
            result,
            meta: {
                page: safePage,
                pageSize: safePageSize,
                totalItems,
                totalPages,
                hasNextPage: safePage < totalPages,
                hasPrevPage: safePage > 1,
            },
        };
    }

    async deleteUser(userId: string, password: string) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, parseInt(userId)));

        if (!user) {
            throw new AppError(
                'Invalid credentials',
                401,
                ErrorCode.INVALID_CREDENTIALS,
            );
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError(
                'Invalid credentials',
                401,
                ErrorCode.INVALID_CREDENTIALS,
            );
        }

        await db.delete(users).where(eq(users.id, parseInt(userId)));
        return { result: null, message: 'User deleted successfully' };
    }
}
