import { Injectable } from '@nestjs/common';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

@Injectable()
export class ResumeService {
    public async extractTextFromPDF(fileBuffer: Buffer): Promise<string> {
        const data = await pdf(fileBuffer);
        return data.text;
    }

    public async extractTextFromDOCX(fileBuffer: Buffer): Promise<string> {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        return result.value;
    }

    public cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ') // заменяет несколько пробелов на один
            .replace(/[^\w\s@.-]/g, '') // сохраняем @, точку и дефис, так как они нужны для email и телефонов
            .toLowerCase(); // приводит к нижнему регистру
    }

    public extractContacts(text: string) {
        // Регулярное выражение для телефонных номеров, исключающее даты и слишком короткие строки
        const phoneRegex =
            /(?:\+?\d{1,3}[-\s]?)?(?:\(?\d{1,4}?\)?[-\s]?)?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,4}(?!\d{4}[-\s]?\d{4})/g;
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

        const phoneNumbers = (text.match(phoneRegex) || []).filter((phone) => {
            // Фильтрация номеров телефонов с длиной более 7 цифр (или если есть дополнительные символы)
            return phone.replace(/\D/g, '').length > 7;
        });

        const emails = text.match(emailRegex) || [];

        return { phoneNumbers, emails };
    }

    public async processResume(file: Express.Multer.File, fileType: 'pdf' | 'docx') {
        let resumeText = '';
        if (fileType === 'pdf') {
            resumeText = await this.extractTextFromPDF(file.buffer);
        } else if (fileType === 'docx') {
            resumeText = await this.extractTextFromDOCX(file.buffer);
        }

        const cleanedText = this.cleanText(resumeText);
        const contacts = this.extractContacts(cleanedText);

        return { cleanedText, contacts };
    }
}
