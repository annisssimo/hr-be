import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { Injectable } from '@nestjs/common';

import { settings } from '../../../../config/settings';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: settings.EMAIL.host,
            port: settings.EMAIL.port,
            secure: settings.EMAIL.secure,
            auth: {
                user: settings.EMAIL.user,
                pass: settings.EMAIL.pass,
            },
        });
    }

    public async sendTemplateMail(
        to: string,
        subject: string,
        templateName: string,
        variables: Record<string, string | boolean>,
    ) {
        const html = this.loadTemplate(templateName, variables);
        await this.transporter.sendMail({ from: settings.EMAIL.user, to, subject, html });
    }

    public async sendPasswordResetEmail(
        to: string,
        firstName: string,
        lastName: string,
        resetLink: string,
    ) {
        await this.sendTemplateMail(to, 'Password Reset Request', 'passwordReset', {
            firstName,
            lastName,
            resetLink,
        });
    }

    public async sendRegistrationStatusEmail(to: string, isConfirmed: boolean, userName: string) {
        await this.sendTemplateMail(
            to,
            isConfirmed
                ? 'Your registration has been approved'
                : 'Your registration has been declined',
            'registrationStatus',
            {
                userName,
                isConfirmed,
                loginLink: `${process.env.FRONTEND_PROD_BASE_URL}/auth/login`,
            },
        );
    }

    private loadTemplate(templateName: string, variables: Record<string, string | boolean>) {
        const basePath = process.env.NODE_ENV === 'production' ? 'dist/src' : 'src';

        const templatesPath = path.join(
            process.cwd(),
            basePath,
            'modules/shared/mail/templates',
            `${templateName}.hbs`,
        );

        if (!fs.existsSync(templatesPath)) {
            console.error('Template not found:', templatesPath);
            throw new Error(`Template ${templateName} not found`);
        }

        const templateSource = fs.readFileSync(templatesPath, 'utf8');
        const template = Handlebars.compile(templateSource);
        return template(variables);
    }
}
