import dotenv from 'dotenv';

dotenv.config();

export const settings = {
    DATABASE: {
        url: process.env.DATABASE_URL || '',
        schema: 'career_day',
    },
    CLOUDINARY: {
        cloudName: process.env.CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
    JWT: {
        secret: process.env.JWT_SECRET,
    },
    EMAIL: {
        host: process.env.EMAIL_HOST || '',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
};
