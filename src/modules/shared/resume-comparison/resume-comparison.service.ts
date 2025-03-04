import { Injectable } from '@nestjs/common';

@Injectable()
export class ResumeComparisonService {
    public cleanTextForComparison(text: string): string {
        return text
            .toLowerCase()
            .replace(/\s+/g, ' ') // Убираем лишние пробелы
            .replace(/[^\w\s]/g, ''); // Убираем все ненужные символы
    }

    public extractKeywords(text: string): string[] {
        const commonSkills = [
            'html',
            'css',
            'javascript',
            'react',
            'nodejs',
            'typescript',
            'redux',
            'git',
            'mysql',
            'postgresql',
            'java',
            'python',
            'docker',
        ];
        const words = this.cleanTextForComparison(text).split(' ');
        return words.filter((word) => commonSkills.includes(word));
    }

    public calculateMatch(resumeText: string, jobText: string): number {
        const resumeKeywords = this.extractKeywords(resumeText);
        const jobKeywords = this.extractKeywords(jobText);

        const commonKeywords = resumeKeywords.filter((keyword) => jobKeywords.includes(keyword));
        const matchPercentage = (commonKeywords.length / jobKeywords.length) * 100;

        return matchPercentage;
    }
}
