import { Module } from '@nestjs/common';

import { CloudinaryService } from './cloudinary.service';
import { DrizzleProvider } from './drizzle.provider';
import { DrizzleService } from './drizzle.service';

@Module({
    providers: [CloudinaryService, DrizzleProvider, DrizzleService],
    exports: [CloudinaryService, DrizzleProvider, DrizzleService],
})
export class ProvidersModule {}
