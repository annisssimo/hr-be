import { faker } from '@faker-js/faker/.';
import { INestApplication } from '@nestjs/common';

import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';
import { setupTestApp } from '../../utils/setupTestApp';
import { MailService } from '../../../src/modules/shared/passwordReset/mail.service';
import { HTTP_CODES } from '../../../src/constants';

describe('[POST] /v1/auth/password-reset/request', () => {
    let app: INestApplication;
    let api: Api;
    let factory: Factory;
    let mailServiceMock: sinon.SinonStubbedInstance<MailService>;

    beforeAll(async () => {
        ({ app, api, factory, mailServiceMock } = await setupTestApp());
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(() => {
        mailServiceMock.sendMail.resetHistory();
    });

    it('should return 201 when password reset request is successful', async () => {
        const user = await factory.user();
        const email = user.payload.email;

        const result = await api.request.passwordRequestReset({ email });

        expect(result.status).toBe(HTTP_CODES.CREATED);
        expect(mailServiceMock.sendMail.calledOnce).toBe(true);
    });

    it('should return 404 if email is not found', async () => {
        const result = await api.request.passwordRequestReset({ email: faker.internet.email() });

        expect(result.status).toBe(HTTP_CODES.NOT_FOUND);
        expect(mailServiceMock.sendMail.called).toBe(false);
    });

    it('should return 400 if email format is invalid', async () => {
        const invalidEmail = 'invalid-email-format';

        const result = await api.request.passwordRequestReset({ email: invalidEmail });

        expect(result.status).toBe(HTTP_CODES.BAD_REQUEST);
        expect(mailServiceMock.sendMail.called).toBe(false);
    });

    it('should return 201 for multiple valid requests', async () => {
        const user = await factory.user();
        const email = user.payload.email;

        const firstResult = await api.request.passwordRequestReset({ email });
        expect(firstResult.status).toBe(HTTP_CODES.CREATED);
        expect(mailServiceMock.sendMail.calledOnce).toBe(true);

        const secondResult = await api.request.passwordRequestReset({ email });
        expect(secondResult.status).toBe(HTTP_CODES.CREATED);
        expect(mailServiceMock.sendMail.calledTwice).toBe(true);
    });
});
