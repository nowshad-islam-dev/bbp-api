import { Request, Response, NextFunction } from 'express';
import ENV from '@/config/env';
import { BaseController } from './base.controller';
import { AuthService } from '@/services/auth.service';
import { SignupBody, LoginBody } from '@/validators/auth';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';

export class AuthController extends BaseController {
    constructor(private authService: AuthService) {
        super();
    }

    verifyEmail = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const token = req.query['token'] as string;
            return await this.authService.verifyEmail(token);
        });
    };

    signup = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { firstName, lastName, email, password, phone } =
                req.body as SignupBody;
            return await this.authService.signup(
                firstName,
                lastName,
                email,
                password,
                phone,
            );
        });
    };

    login = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { email, password } = req.body as LoginBody;
            const { accessToken, refreshToken, user } =
                await this.authService.login(email, password);
            res.cookie('refreshToken', refreshToken, {
                maxAge: ENV.REFRESH_TOKEN_EXPIRY * 1000, // in ms
                httpOnly: true,
                sameSite: 'strict',
                secure: ENV.NODE_ENV === 'production',
            });
            return { accessToken, user };
        });
    };

    adminLogin = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { email, password } = req.body as LoginBody;
            const { accessToken, refreshToken, user } =
                await this.authService.adminLogin(email, password);
            res.cookie('refreshToken', refreshToken, {
                maxAge: ENV.REFRESH_TOKEN_EXPIRY * 1000, // in ms
                httpOnly: true,
                sameSite: 'strict',
                secure: ENV.NODE_ENV === 'production',
            });
            return { accessToken, user };
        });
    };

    createAdmin = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const { firstName, lastName, email, password, phone } =
                req.body as SignupBody;
            return await this.authService.createAdmin(
                firstName,
                lastName,
                email,
                password,
                phone,
            );
        });
    };

    // ***Note: logout and refreshUserToken works for both auth and adminAuth*** //
    refreshUserToken = (
        req: Request,
        res: Response,
        next: NextFunction,
    ): void => {
        this.handleRequest(req, res, next, async () => {
            const cookies = req.cookies as { refreshToken?: string };
            const refreshToken = cookies.refreshToken;
            if (!refreshToken) {
                throw new AppError(
                    'Invalid refresh token',
                    401,
                    ErrorCode.INVALID_TOKEN,
                );
            }
            const { accessToken, newRefreshToken } =
                await this.authService.refreshToken(refreshToken);
            res.cookie('refreshToken', newRefreshToken, {
                maxAge: ENV.REFRESH_TOKEN_EXPIRY * 1000, // in ms
                httpOnly: true,
                sameSite: 'strict',
                secure: ENV.NODE_ENV === 'production',
            });
            return { accessToken };
        });
    };

    logout = (req: Request, res: Response, next: NextFunction): void => {
        this.handleRequest(req, res, next, async () => {
            const cookies = req.cookies as { refreshToken?: string };
            const refreshToken = cookies.refreshToken;
            if (!refreshToken) {
                throw new AppError(
                    'Refresh token missing in cookie',
                    401,
                    ErrorCode.INVALID_TOKEN,
                );
            }
            await this.authService.logout(refreshToken);
            res.clearCookie('refreshToken', {
                httpOnly: true,
                sameSite: 'strict',
                secure: ENV.NODE_ENV === 'production',
            });
            return null;
        });
    };
}
