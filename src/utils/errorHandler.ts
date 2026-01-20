import { AppError } from './appError';
import { logger } from '@/config/logger';
import { ErrorCode } from './errorCode';

type MySQLError = {
    code?: string;
    errno?: number;
    sqlState?: string;
    message: string;
};

export class ErrorHandler {
    static handle(error: unknown, context: string): AppError {
        // Drizzle / MySQL errors
        if (this.isMySQLError(error)) {
            const dbError = this.handleMySQLError(error);

            logger.warn('MySQL error occurred', {
                context,
                message: dbError.message,
                statusCode: dbError.statusCode,
                code: dbError.code,
                mysqlCode: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                rawMessage: error.message,
            });

            return dbError;
        }

        // Application errors
        if (error instanceof AppError) {
            logger.warn('Application error occurred', {
                context,
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                details: error.details,
                stack: error.stack,
            });

            return error;
        }

        // Unknown errors
        logger.error('Unknown error occurred', {
            context,
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            raw: error,
        });

        return new AppError(
            'Internal server error',
            500,
            ErrorCode.INTERNAL_SERVER_ERROR,
            false,
        );
    }

    private static isMySQLError(error: any): error is MySQLError {
        return (
            typeof error === 'object' &&
            error !== null &&
            typeof error.message === 'string' &&
            typeof error.code === 'string'
        );
    }

    private static handleMySQLError(error: MySQLError): AppError {
        switch (error.code) {
            case 'ER_DUP_ENTRY':
                return new AppError(
                    'Resource already exists',
                    409,
                    ErrorCode.ALREADY_EXISTS,
                );

            case 'ER_NO_REFERENCED_ROW_2':
            case 'ER_ROW_IS_REFERENCED_2':
                return new AppError(
                    'Invalid reference',
                    400,
                    ErrorCode.VALIDATION_ERROR,
                );

            case 'ER_BAD_NULL_ERROR':
                return new AppError(
                    'Missing required field',
                    400,
                    ErrorCode.VALIDATION_ERROR,
                );

            case 'ER_DATA_TOO_LONG':
                return new AppError(
                    'Input value too long',
                    400,
                    ErrorCode.VALIDATION_ERROR,
                );

            default:
                return new AppError(
                    'Database error',
                    500,
                    ErrorCode.DB_ERROR,
                    false,
                );
        }
    }
}

// Add more specific error types
export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, ErrorCode.VALIDATION_ERROR);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string) {
        super(message, 500, ErrorCode.DB_ERROR);
    }
}
