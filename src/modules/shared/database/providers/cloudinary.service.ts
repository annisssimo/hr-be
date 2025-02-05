import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

import { settings } from '../../../../../config/settings';

@Injectable()
export class CloudinaryService {
    constructor() {
        this.cloudinarySetUp();
    }

    public async uploadImage(url: string, publicId: string, folder: string) {
        try {
            const uploadImage = await cloudinary.uploader.upload(url, {
                public_id: publicId,
                folder: folder,
            });
            return uploadImage;
        } catch (error) {
            console.error('Error uploading image', error);
            throw new Error('Image upload failed');
        }
    }

    private cloudinarySetUp() {
        cloudinary.config({
            cloud_name: settings.CLOUDINARY.cloudName,
            api_key: settings.CLOUDINARY.apiKey,
            api_secret: settings.CLOUDINARY.apiSecret,
        });
    }
}
