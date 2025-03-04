import { Get, Post, Body, Param, Put, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { Vacancy } from '../../shared/database/models';
import { VacanciesService } from '../../shared/vacancies/vacancies.service';
import { ControllerGuard } from '../../../guards/controller.guard';
import { Controller } from '../../../decorators/controller.decorator';
import { CreateVacancyDtoSchema, UpdateVacancyDtoSchema } from './vacancies.schema';
import { z } from 'zod';

@UseGuards(ControllerGuard)
@Controller('v1/vacancies', {
    requireAuth: true,
})
export class VacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) {}

    // Создание новой вакансии
    @Post()
    public async createVacancy(@Body() body: unknown): Promise<Vacancy> {
        const vacancyData = CreateVacancyDtoSchema.parse(body);

        const data = {
            ...vacancyData,
            location: vacancyData.location ?? null,
            salary: vacancyData.salary ?? null,
        };

        return this.vacanciesService.createVacancy(data);
    }

    // Получение списка всех вакансий
    @Get()
    public async getAllVacancies(): Promise<Vacancy[]> {
        return this.vacanciesService.getAllVacancies();
    }

    // Получение вакансии по ID
    @Get(':id')
    public async getVacancyById(@Param('id') id: string): Promise<Vacancy> {
        const vacancy = await this.vacanciesService.getVacancyById(id);
        if (!vacancy) {
            throw new NotFoundException('Vacancy not found');
        }
        return vacancy;
    }

    // Обновление вакансии
    @Put(':id')
    public async updateVacancy(
        @Param('id') id: string,
        @Body() vacancyData: z.infer<typeof UpdateVacancyDtoSchema>,
    ): Promise<Vacancy> {
        const updatedVacancy = await this.vacanciesService.updateVacancy(id, vacancyData);
        if (!updatedVacancy) {
            throw new NotFoundException('Vacancy not found');
        }
        return updatedVacancy;
    }

    // Удаление вакансии
    @Delete(':id')
    public async deleteVacancy(@Param('id') id: string): Promise<{ success: boolean }> {
        const isDeleted = await this.vacanciesService.deleteVacancy(id);
        if (!isDeleted) {
            throw new NotFoundException('Vacancy not found');
        }
        return { success: true };
    }
}
