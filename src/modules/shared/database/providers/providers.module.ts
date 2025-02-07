import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { DrizzleService } from './drizzle.service';
import { DrizzleProvider } from './drizzle.provider';
import { DbConnectionGuard } from '../../../../guards/dbConnection.guard';

@Module({
    providers: [CloudinaryService, DrizzleProvider, DrizzleService, DbConnectionGuard],
    exports: [CloudinaryService, DrizzleProvider, DrizzleService, DbConnectionGuard],
})
export class ProvidersModule {}
