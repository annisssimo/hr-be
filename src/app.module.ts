import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EndpointsModule } from './modules/endpoints/endpoints.module';

@Module({
    imports: [EndpointsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
