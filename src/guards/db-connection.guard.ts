import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { DrizzleService } from '../modules/shared/database/providers/drizzle.service';

@Injectable()
export class DbConnectionGuard implements CanActivate {
    constructor(private readonly drizzleService: DrizzleService) {}

    public canActivate(_context: ExecutionContext): boolean {
        if (!this.drizzleService.isDbConnected()) {
            throw new HttpException(
                'Service experiences database outage',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
        return true;
    }
}
