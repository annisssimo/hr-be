import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ResumeService } from '../../shared/resume/resume.service';
import { ResumeComparisonService } from '../../shared/resume-comparison/resume-comparison.service';

@Controller('resume')
export class ResumeController {
    constructor(
        private readonly resumeService: ResumeService,
        private readonly resumeComparisonService: ResumeComparisonService,
    ) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    public async uploadResume(@UploadedFile() file: Express.Multer.File) {
        const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'docx';
        const { cleanedText, contacts } = await this.resumeService.processResume(file, fileType);

        return { cleanedText, contacts };
    }

    @Post('compare')
    public compare(@Body() body: { resumeText: string; jobText: string }): {
        matchPercentage: number;
    } {
        const { resumeText, jobText } = body;
        const matchPercentage = this.resumeComparisonService.calculateMatch(resumeText, jobText);
        return { matchPercentage };
    }
}
