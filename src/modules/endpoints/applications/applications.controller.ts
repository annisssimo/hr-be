import { Get, Post, Body, Param, Put, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ApplicationsService } from '../../shared/applications/applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './applications.schema';
import { ControllerGuard } from '../../../guards/controller.guard';
import { Controller } from '../../../decorators/controller.decorator';

@UseGuards(ControllerGuard)
@Controller('v1/applications', {
    requireAuth: true,
})
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) {}

    // Создание заявки
    @Post()
    public async createApplication(
        @Body() { candidateId, vacancyId, resumeId, coverLetter, source }: CreateApplicationDto,
    ) {
        return this.applicationsService.createApplication({
            candidateId,
            vacancyId,
            resumeId,
            coverLetter,
            source,
        });
    }

    // Получение всех заявок
    @Get()
    public async getAllApplications() {
        return this.applicationsService.getAllApplications();
    }

    // Получение заявки по ID
    @Get(':id')
    public async getApplicationById(@Param('id') id: string) {
        const application = await this.applicationsService.getApplicationById(id);
        if (!application) {
            throw new NotFoundException('Application not found');
        }
        return application;
    }

    // Получение заявок кандидата
    @Get('candidate/:candidateId')
    public async getApplicationsByCandidateId(@Param('candidateId') candidateId: string) {
        return this.applicationsService.getApplicationsByCandidateId(candidateId);
    }

    @Get('vacancy/:vacancyId')
    public async getApplicationsByVacancyId(@Param('vacancyId') vacancyId: string) {
        const applications =
            await this.applicationsService.getRankedApplicationsForVacancy(vacancyId);
        if (!applications.length) {
            throw new NotFoundException('No applications found for this vacancy');
        }
        return applications;
    }

    // Обновление статуса заявки
    @Put(':id/status')
    public async updateApplicationStatus(
        @Param('id') id: string,
        @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
    ) {
        const updatedApplication = await this.applicationsService.updateApplicationStatus(
            id,
            updateApplicationStatusDto.status,
        );
        if (!updatedApplication) {
            throw new NotFoundException('Application not found');
        }
        return updatedApplication;
    }

    // Удаление заявки
    @Delete(':id')
    public async deleteApplication(@Param('id') id: string) {
        const isDeleted = await this.applicationsService.deleteApplication(id);
        if (!isDeleted) {
            throw new NotFoundException('Application not found');
        }
        return { success: true };
    }
}
