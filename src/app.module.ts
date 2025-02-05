import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { settings } from '../config/settings';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EndpointsModule } from './modules/endpoints/endpoints.module';

@Module({
    imports: [
        EndpointsModule,
        JwtModule.register({
            global: true,
            secret: settings.JWT.secret,
            signOptions: { expiresIn: '2h' },
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
