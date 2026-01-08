export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;
    public readonly details?: unknown;

    constructor(
        message: string,
        statusCode: number,
        code = 'APPLICATION_ERROR',
        details?: unknown,
    ) {
        super(message);

        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace?.(this, this.constructor);
    }
}
