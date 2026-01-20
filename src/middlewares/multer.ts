import path from 'node:path';
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import ImageKit from 'imagekit';
import ENV from '@/config/env';
import { imageRules } from '@/media-config/image';
import { AppError } from '@/utils/appError';
import { ErrorCode } from '@/utils/errorCode';

const client = new ImageKit({
    publicKey: ENV['IMAGEKIT_PUBLIC_KEY'],
    privateKey: ENV['IMAGEKIT_PRIVATE_KEY'],
    urlEndpoint: ENV['IMAGEKIT_URL_ENDPOINT'],
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Required types
type File = Express.Multer.File;

interface BufferFile {
    buffer: Buffer<ArrayBufferLike>;
    originalname: string;
    mimetype: string;
}

type FolderName = 'news' | 'candidate' | 'default';

// Switch to memoryStorage to temporary store
// images in ram before uploading to ima
const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: File, cb: FileFilterCallback) {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'));
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 Mb
});

//Image file name generator utility
const generateImageFilename = (originalname: string) => {
    const basename = path.parse(originalname).name.replace(/\s+/g, '_');
    return `${basename}-${nanoid()}.jpeg`;
};

// Upload to imagekit
async function uploadToImagekit(file: BufferFile, folderName: string) {
    const fileName = generateImageFilename(file.originalname);

    const uploadResponse = await client.upload({
        // Direct buffer upload
        file: file.buffer,
        fileName,
        useUniqueFileName: true,
        folder: folderName,
    });

    return uploadResponse;
}

export const uploadSingle =
    (fieldName: string, folderName: FolderName) =>
    (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                throw new AppError(
                    err.message,
                    400,
                    ErrorCode.FILE_UPLOAD_ERROR,
                );
            } else if (err) {
                if (err instanceof Error) {
                    throw new AppError(
                        err.message,
                        400,
                        ErrorCode.FILE_UPLOAD_ERROR,
                    );
                }
            }

            void (async () => {
                try {
                    if (req.file) {
                        const rules =
                            imageRules[folderName] || imageRules.default;

                        // Using memoryStorage gives direct acces to file.buffer
                        const processedBuffer = await sharp(req.file.buffer)
                            .resize(rules.width, rules.height, {
                                fit: 'inside',
                            })
                            .jpeg({ quality: rules.quality })
                            .toBuffer();

                        // Upload processed buffer to ImageKit
                        // No temp file created on disk
                        // No cleanup required
                        const result = await uploadToImagekit(
                            {
                                buffer: processedBuffer,
                                originalname: req.file.originalname,
                                mimetype: 'image/jpeg',
                            },
                            folderName,
                        );
                        // Attach the url to res object
                        res.locals.fileUrl = result.url;
                    }
                    next();
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        throw new AppError(
                            e.message,
                            500,
                            ErrorCode.FILE_UPLOAD_ERROR,
                        );
                    }
                    next();
                }
            })();
        });
    };

export const uploadArray =
    (fieldName: string, folderName: FolderName) =>
    (req: Request, res: Response, next: NextFunction) => {
        upload.array(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                throw new AppError(
                    err.message,
                    400,
                    ErrorCode.FILE_UPLOAD_ERROR,
                );
            } else if (err) {
                if (err instanceof Error) {
                    throw new AppError(
                        err.message,
                        400,
                        ErrorCode.FILE_UPLOAD_ERROR,
                    );
                }
            }

            void (async () => {
                try {
                    if (
                        req.files &&
                        Array.isArray(req.files) &&
                        req.files.length > 0
                    ) {
                        const rules =
                            imageRules[folderName] || imageRules.default;

                        // Map files to async uploads and await all
                        const uploadPromises = req.files.map(async (file) => {
                            const processedBuffer = await sharp(file.buffer)
                                .resize(rules.width, rules.height, {
                                    fit: 'inside',
                                })
                                .jpeg({ quality: rules.quality })
                                .toBuffer();

                            const result = await uploadToImagekit(
                                {
                                    buffer: processedBuffer,
                                    originalname: file.originalname,
                                    mimetype: 'image/jpeg',
                                },
                                folderName,
                            );

                            return result.url;
                        });

                        const fileUrls = await Promise.all(uploadPromises);
                        res.locals.fileUrls = fileUrls;
                    }
                    next();
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        if (e instanceof Error) {
                            throw new AppError(
                                e.message,
                                500,
                                ErrorCode.FILE_UPLOAD_ERROR,
                            );
                        }
                    }
                    next();
                }
            })();
        });
    };
