import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';

import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';
import { setupTestApp } from '../../utils/setup-test-app';
import { HTTP_CODES, ERROR_MESSAGES } from '../../../src/constants';

describe('[POST] /v1/auth/password-reset/reset', () => {
    let app: INestApplication;
    let api: Api;
    let factory: Factory;

    beforeAll(async () => {
        ({ app, api, factory } = await setupTestApp());
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return 200 when password reset is successful', async () => {
        const { payload } = await factory.user();
        const token = (await factory.token(payload.id)).result.token;
        const newPassword = faker.string.alphanumeric(10) + '1A';
        const result = await api.request.passwordReset({ token, newPassword });

        expect(result.status).toBe(HTTP_CODES.OK);
    });

    it('should return 400 if token is invalid', async () => {
        const token = faker.string.uuid();
        const newPassword = faker.internet.password();

        const result = await api.request.passwordReset({ token, newPassword });

        expect(result.status).toBe(HTTP_CODES.BAD_REQUEST);
        expect(result.body.message).toBe(ERROR_MESSAGES.TOKEN_INVALID);
    });

    it('should return 400 if newPassword is invalid', async () => {
        const token = faker.string.uuid();
        const invalidPassword = 'short';

        const result = await api.request.passwordReset({ token, newPassword: invalidPassword });

        expect(result.status).toBe(HTTP_CODES.BAD_REQUEST);
    });
});
