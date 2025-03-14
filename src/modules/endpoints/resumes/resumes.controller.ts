import {
    UseGuards,
    UsePipes,
    Post,
    HttpCode,
    Body,
    Delete,
    Param,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumesService } from '../../shared/resumes/resumes.service';
import { ControllerGuard } from '../../../guards/controller.guard';
import { Controller } from '../../../decorators/controller.decorator';
import { ZodValidationPipe } from '../../validation/validation.pipe';
import { ResumesListParams, ResumesListSchema, CreateResumeDto } from './resumes.schema';
import { multerConfig } from '../../../../multer.config';

@UseGuards(ControllerGuard)
@Controller('v1/resumes', { requireAuth: true })
export class ResumesController {
    constructor(private readonly resumesService: ResumesService) {}

    @Post('list')
    @HttpCode(200)
    @UsePipes(new ZodValidationPipe(ResumesListSchema))
    public async getResumesList(@Body() body: ResumesListParams) {
        return this.resumesService.list(body);
    }

    @Post()
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('file', multerConfig))
    public async createResume(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateResumeDto,
    ) {
        const resumeData = {
            ...body,
            filePath: file?.path,
        };
        return this.resumesService.create(resumeData);
    }

    @Delete(':id')
    @HttpCode(204)
    public async deleteResume(@Param('id') resumeId: string) {
        return this.resumesService.delete(resumeId);
    }
}
