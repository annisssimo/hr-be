import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ZodSchema, ZodError } from 'zod';
import { JWTService } from '../modules/shared/jwt/jwt.service';
import { PROVIDERS, USER_STATUS, USER_ROLE } from '../constants/index';
import { users } from '../modules/shared/database/models';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

@Injectable()
export class ControllerGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JWTService,
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const validationSchema = this.reflector.get<ZodSchema>(
            'validationSchema',
            context.getClass(),
        );
        if (validationSchema) {
            try {
                request.body = validationSchema.parse(request.body);
            } catch (error) {
                if (error instanceof ZodError) {
                    const formattedErrors = error.errors.map((err) => ({
                        message: err.message,
                        field: err.path.join('.'),
                    }));
                    throw new BadRequestException({
                        message: 'Validation failed',
                        errors: formattedErrors,
                    });
                } else {
                    throw new BadRequestException(`Unexpected error: ${error.message}`);
                }
            }
        }

        const requireAuth = this.reflector.get<boolean>('requireAuth', context.getClass());
        if (requireAuth) {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                throw new UnauthorizedException('No authorization header provided');
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                throw new UnauthorizedException('Token not found');
            }

            try {
                const JWTpayload = this.jwtService.verify(token);
                const [user] = await this.drizzle
                    .select()
                    .from(users)
                    .where(eq(users.id, JWTpayload.id));
                const res = context.switchToHttp().getResponse();
                res.locals.user = user;
            } catch (_error) {
                throw new UnauthorizedException(`Problem occurred: ${_error.message}`);
            }
        }

        const statusCheck = this.reflector.get<boolean>('statusCheck', context.getClass());
        if (statusCheck) {
            const userPayload = request.body.email;
            if (!userPayload) {
                throw new UnauthorizedException('User information not available for status check');
            }
            const [user] = await this.drizzle
                .select()
                .from(users)
                .where(eq(users.email, userPayload));
            if (!user) {
                throw new UnauthorizedException('Password or email are invalid');
            }
            if (user.status !== USER_STATUS.ACTIVE) {
                throw new ForbiddenException('Access denied');
            }
        }

        const allowedRoles =
            this.reflector.get<USER_ROLE[]>('allowedRoles', context.getClass()) ||
            this.reflector.get<boolean>('allowedRoles', context.getHandler());
        if (allowedRoles && allowedRoles.length > 0) {
            const res = context.switchToHttp().getResponse();
            const user = res.locals.user;
            if (!user || !user.role) {
                throw new UnauthorizedException('User role not found');
            }
            if (!allowedRoles.includes(user.role)) {
                throw new ForbiddenException('User does not have the required role');
            }
        }

        return true;
    }
}
