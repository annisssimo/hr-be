import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JWTService } from './jwt.service';
import { settings } from '../../../../config/settings';

@Module({
    imports: [
        JwtModule.register({
            secret: settings.JWT.secret,
            signOptions: { expiresIn: '2h' },
        }),
    ],
    providers: [JWTService],
    exports: [JWTService],
})
export class JWTModule {}
