// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user: {
                userId: string;
                role: string;
            };
            requestId: string;
        }
    }
}
