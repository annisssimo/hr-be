import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { DrizzleService } from './drizzle.service';
import { DrizzleProvider } from './drizzle.provider';

@Module({
    providers: [CloudinaryService, DrizzleProvider, DrizzleService],
    exports: [CloudinaryService, DrizzleProvider, DrizzleService],
})
export class ProvidersModule {}
