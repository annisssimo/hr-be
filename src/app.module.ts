import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'assets'),
            serveRoot: '/assets',
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
