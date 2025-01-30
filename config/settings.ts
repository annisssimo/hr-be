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
};
