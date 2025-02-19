import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

import { settings } from '../../../../../config/settings';

@Injectable()
export class CloudinaryService {
    constructor() {
        this.cloudinarySetUp();
    }

    public async uploadImage(url: string, publicId: string, folder: string) {
        try {
            const uploadedImage = await cloudinary.uploader.upload(url, {
                public_id: publicId,
                folder: folder,
            });
            return uploadedImage;
        } catch (error) {
            console.error('Error uploading image', error);
            throw new Error('Image upload failed');
        }
    }

    public async deleteImage(publicId: string, folder: string) {
        const result = await cloudinary.uploader.destroy(`${folder}/${publicId}`);
        if (result.result != 'ok') {
            if (result.result == 'not found') {
                throw new NotFoundException(result.result);
            }
            throw new InternalServerErrorException(result.result);
        }
        return result;
    }

    private cloudinarySetUp() {
        cloudinary.config({
            cloud_name: settings.CLOUDINARY.cloudName,
            api_key: settings.CLOUDINARY.apiKey,
            api_secret: settings.CLOUDINARY.apiSecret,
        });
    }
}
