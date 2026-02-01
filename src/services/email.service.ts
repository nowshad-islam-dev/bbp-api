import nodemailer from 'nodemailer';
import ENV from '@/config/env';
import { logger } from '@/config/logger';
import { getVerificationEmailTemplate } from '@/templates/emails';

export class EmailService {
    private transporter!: nodemailer.Transporter;
    private readonly fromAddress: string;

    constructor() {
        // Production SMTP setup
        if (ENV.NODE_ENV === 'production') {
            this.transporter = nodemailer.createTransport({
                host: ENV.SMTP_HOST,
                port: ENV.SMTP_PORT,
                secure: ENV.SMTP_PORT === 465,
                auth: {
                    user: ENV.SMTP_USER,
                    pass: ENV.SMTP_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: true,
                },
            });
        }
        // For dev only
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: ENV.GMAIL,
                pass: process.env.GOOGLE_APP_PASSWORD,
            },
        });

        this.fromAddress =
            ENV.SMTP_FROM || 'noreply@ballot-beyond-politics.com';

        logger.info('Using SMTP configuration', {
            context: 'EmailService.constructor',
            host: ENV.NODE_ENV === 'production' ? ENV.SMTP_HOST : 'Gmail',
        });

        // Add email template precompilation
        this.precompileTemplates();
        // Add connection testing
        // this.testConnection();
    }

    // private async testConnection() {
    //     try {
    //         await this.transporter.verify();
    //         logger.info('Smtp connection verified');
    //     } catch (err) {
    //         logger.error('Failed to verify smtp connection', err);
    //     }
    // }

    private precompileTemplates() {
        try {
            getVerificationEmailTemplate('test', 'test://verify.com');
            logger.info('Email templates precompiled successfully');
        } catch (err) {
            logger.error('Failed to precompile email templates', err);
        }
    }

    async sendVerificationEmail(
        to: string,
        name: string,
        verificationToken: string, // Generated raw token
    ): Promise<void> {
        /** Note:  Use frontend URL in production */
        const verificationUrl = [
            `${ENV.SERVER_URL}/api/auth/verify-email?token=${verificationToken}`,
            `${ENV.FRONTEND_URL}/verify-email?token=${verificationToken}`,
        ];
        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const info = await this.transporter.sendMail({
                from:
                    ENV.NODE_ENV === 'production'
                        ? this.fromAddress
                        : ENV.GMAIL,
                to,
                subject: 'Verify your email',
                html: getVerificationEmailTemplate(name, verificationUrl[0]),
            });
            logger.info('Verification email sent', {
                context: 'EmailService.sendVerificationEmail',
                to,
                messageId: info.messageId,
            });
        } catch (err) {
            logger.error('Failed to send verification email', {
                context: 'EmailService.sendVerificationEmail',
                error: err instanceof Error ? err.message : 'Unknown error',
                to,
            });
            throw err;
        }
    }
}
