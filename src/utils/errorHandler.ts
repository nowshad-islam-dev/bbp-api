import { AppError } from './appError';
import { ErrorCode } from './errorCode';

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
