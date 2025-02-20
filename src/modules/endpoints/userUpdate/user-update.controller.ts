import {
    ForbiddenException,
    HttpStatus,
    Param,
    Put,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { Controller } from '../../../decorators/controller.decorator';
import { UsersService } from '../../shared/users/users.service';
import { ControllerGuard } from '../../../guards/controller.guard';
import { UpdateSchema } from './user-update.schema';
import { ERROR_MESSAGES, USER_ROLE } from '../../../constants';
import { Request, Response } from 'express';
import { CloudinaryService } from '../../shared/database/providers/cloudinary.service';
import { settings } from '../../../../config/settings';

@UseGuards(ControllerGuard)
@Controller('v1/users', {
    requireAuth: true,
    validationSchema: UpdateSchema,
})
export class UserUpdateController {
    constructor(
        private readonly usersService: UsersService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Put(':userId')
    public async updateUser(
        @Param('userId') userId: string,
        @Req() request: Request,
        @Res() response: Response,
    ) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
        }
        const user = response.locals.user;
        if (request.body.role || request.body.status) {
            if (user.role !== USER_ROLE.ADMIN) {
                throw new ForbiddenException(ERROR_MESSAGES.NO_PERMISSION);
            }
        }
        if (request.body.managerId) {
            if (user.role === USER_ROLE.EMPLOYEE) {
                throw new ForbiddenException('You do not have permission to do this');
            }
        }
        if (user.role === USER_ROLE.EMPLOYEE && user.id != userId) {
            throw new ForbiddenException(ERROR_MESSAGES.NO_PERMISSION);
        }
        const requestData = request.body;
        if (requestData.hasOwnProperty('avatar') && requestData.avatar === null) {
            if (user.avatar) {
                const avatarUrl = user.avatar;
                const fileName = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
                const publicId = fileName.split('.')[0];
                await this.cloudinaryService.deleteImage(
                    publicId,
                    settings.CLOUDINARY.avatarFolder || '',
                );
            }
            requestData.avatar = null;
        } else if (requestData.avatar) {
            if (user.avatar) {
                const avatarUrl = user.avatar;
                const fileName = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1); // file name with extension
                const publicId = fileName.split('.')[0]; // file name without extension (required by cloudinary)
                await this.cloudinaryService.deleteImage(
                    publicId,
                    settings.CLOUDINARY.avatarFolder || '',
                );
            }
            const uploadResponse = await this.cloudinaryService.uploadImage(
                requestData.avatar,
                userId,
                settings.CLOUDINARY.avatarFolder || '',
            );
            requestData.avatar = uploadResponse.secure_url;
        }
        const {
            id: _id,
            password: _password,
            ...result
        } = await this.usersService.update(userId, requestData);
        return response.status(HttpStatus.OK).json({ ...result });
    }
}
