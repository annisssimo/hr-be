import {
    BadRequestException,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    Inject,
    InternalServerErrorException,
    Param,
    Put,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { Controller } from '../../../decorators/controller.decorator';
import { UsersService } from '../../shared/users/users.service';
import { ControllerGuard } from '../../../guards/controller.guard';
import { UpdateSchema } from './user-update.schema';
import { ZodError } from 'zod';
import { users } from '../../shared/database/models';
import { eq } from 'drizzle-orm';
import { ERROR_MESSAGES, PROVIDERS, USER_ROLE } from '../../../constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { JWTService } from '../../shared/jwt/jwt.service';
import { Request } from 'express';

@UseGuards(ControllerGuard)
@Controller('v1/users', {
    requireAuth: true,
    validationSchema: UpdateSchema,
})
export class UserUpdateController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
        private readonly jwtService: JWTService,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Put(':userId')
    public async updateUser(@Param('userId') userId: string, @Req() request: Request) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);
        }
        const [, token] = authHeader.split(' ');
        const payload = await this.jwtService.verify(token);
        const [userRole] = await this.drizzle
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, payload.id));
        if (request.body.role || request.body.status) {
            if (userRole.role !== USER_ROLE.ADMIN) {
                throw new ForbiddenException(ERROR_MESSAGES.NO_PERMISSION);
            }
        }
        if (request.body.managerId) {
            if (userRole.role === USER_ROLE.EMPLOYEE) {
                throw new ForbiddenException(ERROR_MESSAGES.NO_PERMISSION);
            }
        }
        if (userRole.role === USER_ROLE.EMPLOYEE && payload.id != userId) {
            throw new ForbiddenException(ERROR_MESSAGES.NO_PERMISSION);
        }
        try {
            return this.usersService.update(userId, request.body);
        } catch (error) {
            if (error instanceof ZodError) {
                throw new BadRequestException(error.message);
            } else {
                throw new InternalServerErrorException(ERROR_MESSAGES.SERVER_ERROR);
            }
        }
    }
}
