import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker/.';

import { ERROR_MESSAGES, HTTP_CODES } from '../../../src/constants';
import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';
import { setupTestApp } from '../../utils/setup-test-app';

describe('[POST] api/v1/profile/change-password', () => {
    let app: INestApplication;
    let api: Api;
    let factory: Factory;

    beforeAll(async () => {
        ({ app, api, factory } = await setupTestApp());
    });

    afterAll(async () => {
        await app.close();
    });

    it('should change password successfully with correct old password', async () => {
        const { payload } = await factory.user();
        const response = await api.request.changePassword({
            userId: payload.id,
            oldPassword: payload.password,
            newPassword: faker.string.alphanumeric(10) + '1A',
        });

        expect(response.status).toBe(HTTP_CODES.OK);
    });

    it('should fail with incorrect old password', async () => {
        const { payload } = await factory.user();
        const response = await api.request.changePassword({
            userId: payload.id,
            oldPassword: faker.string.alphanumeric(10) + '1A',
            newPassword: faker.string.alphanumeric(10) + '1A',
        });

        expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED);
    });

    it('should return 404 if user does not exist', async () => {
        const response = await api.request.changePassword({
            userId: faker.string.uuid(),
            oldPassword: faker.string.alphanumeric(10) + '1A',
            newPassword: faker.string.alphanumeric(10) + '1A',
        });

        expect(response.status).toBe(HTTP_CODES.NOT_FOUND);
        expect(response.body.message).toBe(ERROR_MESSAGES.USER_NOT_FOUND);
    });

    it('should return 400 if new password is too weak', async () => {
        const { payload } = await factory.user();
        const response = await api.request.changePassword({
            userId: payload.id,
            oldPassword: payload.password,
            newPassword: '123',
        });

        expect(response.status).toBe(HTTP_CODES.BAD_REQUEST);
    });

    it('should return 400 if new password is the same as old password', async () => {
        const { payload } = await factory.user();
        const response = await api.request.changePassword({
            userId: payload.id,
            oldPassword: payload.password,
            newPassword: payload.password,
        });

        expect(response.status).toBe(HTTP_CODES.BAD_REQUEST);
    });

    it('should allow login with new password after change', async () => {
        const { payload } = await factory.user();
        const newPassword = faker.string.alphanumeric(10) + '1A';

        const changeResponse = await api.request.changePassword({
            userId: payload.id,
            oldPassword: payload.password,
            newPassword,
        });

        expect(changeResponse.status).toBe(HTTP_CODES.OK);

        const loginWithOldPassword = await api.request.login({
            email: payload.email,
            password: payload.password,
        });

        expect(loginWithOldPassword.status).toBe(HTTP_CODES.UNAUTHORIZED);

        const loginWithNewPassword = await api.request.login({
            email: payload.email,
            password: newPassword,
        });

        expect(loginWithNewPassword.status).toBe(HTTP_CODES.OK);
    });
});
