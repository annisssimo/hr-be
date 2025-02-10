import { INestApplication } from '@nestjs/common';
import { USER_STATUS } from '../../../src/constants';
import { setupTestApp } from '../../utils/setupTestApp';
import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';

describe('[POST] api/v1/auth/login', () => {
    let app: INestApplication;
    let api: Api;
    let factory: Factory;

    beforeAll(async () => {
        ({ app, api, factory } = await setupTestApp());
    });

    afterAll(async () => {
        await app.close();
    });

    it('should login successfully with correct credentials', async () => {
        const { payload } = await factory.user({ status: USER_STATUS.ACTIVE });
        const response = await api.request.login({
            email: payload.email,
            password: payload.password,
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accessToken');
    });

    it('should fail with non-existent email', async () => {
        const response = await api.request.login({
            email: 'nonexistent@example.com',
            password: 'anypassword',
        });

        expect(response.status).toBe(401);
    });

    it('should fail with incorrect password', async () => {
        const { payload } = await factory.user({ status: USER_STATUS.ACTIVE });
        const response = await api.request.login({
            email: payload.email,
            password: 'wrongpassword',
        });

        expect(response.status).toBe(401);
    });

    it('should fail if user is archived', async () => {
        const { payload } = await factory.user({ status: USER_STATUS.ARCHIVED });
        const response = await api.request.login({
            email: payload.email,
            password: payload.password,
        });

        expect(response.status).toBe(403);
    });

    it('should fail if user is pending', async () => {
        const { payload } = await factory.user({ status: USER_STATUS.ARCHIVED });
        const response = await api.request.login({
            email: payload.email,
            password: payload.password,
        });

        expect(response.status).toBe(403);
    });

    it('should fail with invalid email format', async () => {
        const response = await api.request.login({
            email: 'invalid-email',
            password: 'validpassword',
        });

        expect(response.status).toBe(400);
    });

    it('should fail with password too short', async () => {
        const response = await api.request.login({
            email: 'valid@example.com',
            password: 'short',
        });

        expect(response.status).toBe(400);
    });
});
