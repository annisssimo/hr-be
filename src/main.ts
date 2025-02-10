import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { DbConnectionGuard } from './guards/dbConnection.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.useGlobalGuards(app.get(DbConnectionGuard));
    app.enableCors();
    await app.listen(3000);
}
bootstrap();
