import { DrizzleModule } from './drizzle.module';
import { CloudinaryModule } from './cloudinary.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [DrizzleModule, CloudinaryModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
