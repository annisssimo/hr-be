import { Body, Inject, Post, UnauthorizedException, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { Controller } from '../../../../decorators/controller.decorator';
import { PROVIDERS } from '../../../../constants/index';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { LoginInputParameters, LoginSchema } from './login.schema';
import { User, users } from '../../../shared/database/models';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { JWTService } from '../../../shared/jwt/jwt.service';
import { ControllerGuard } from '../../../../guards/controller.guard';

@UseGuards(ControllerGuard)
@Controller('v1/auth/login', {
    requireAuth: false,
    statusCheck: true,
    validationSchema: LoginSchema,
})
export class LoginController {
    constructor(
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
        private readonly jwtService: JWTService,
    ) {}

    @Post()
    public async login(@Body() body: LoginInputParameters, @Res() res: Response) {
        const [user] = await this.drizzle.select().from(users).where(eq(users.email, body.email));
        if (!user) {
            throw new UnauthorizedException('Password or email are invalid');
        }
        const isPasswordValid = await bcrypt.compare(body.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Password or email are invalid');
        }
        return res.status(200).json(this.jwtService.sign(user as User));
    }
}
