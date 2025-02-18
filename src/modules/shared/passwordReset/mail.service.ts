import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { Transporter as TransporterType } from 'nodemailer';
import { settings } from '../../../../config/settings';

@Injectable()
export class MailService {
    private transporter: TransporterType;

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

    public async sendMail({ to, subject, html }: MailOptions) {
        await this.transporter.sendMail({ from: settings.EMAIL.user, to, subject, html });
    }
}

interface MailOptions {
    to: string;
    subject: string;
    html?: string;
}
