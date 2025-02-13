import { INestApplication } from '@nestjs/common';
import { USER_ROLE, USER_STATUS } from '../../../src/constants';
import { setupTestApp } from '../../utils/setupTestApp';
import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';

describe('[PUT] /v1/users/:userId', () => {
    let app: INestApplication;
    let api: Api;
    let factory: Factory;

    let adminUser: { result: any; payload: any };
    let adminToken: string;
    let targetUser: { result: any; payload: any };

    beforeAll(async () => {
        const setup = await setupTestApp();
        app = setup.app;
        api = setup.api;
        factory = setup.factory;

        adminUser = await factory.user({
            role: USER_ROLE.ADMIN,
            status: USER_STATUS.ACTIVE,
        });
        const adminLoginRes = await api.request.login({
            email: adminUser.payload.email,
            password: adminUser.payload.password,
        });
        adminToken = adminLoginRes.body.accessToken;

        targetUser = await factory.user({
            role: USER_ROLE.EMPLOYEE,
            status: USER_STATUS.ACTIVE,
        });
    });

    afterAll(async () => {
        await app.close();
    });

    it('should update user confirmation successfully with valid token and valid body', async () => {
        const response = await api.request
            .updateUser(targetUser.result.id, {
                status: USER_STATUS.ARCHIVED,
                role: USER_ROLE.MANAGER,
            })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', targetUser.result.id);
        expect(response.body).toHaveProperty('status', USER_STATUS.ARCHIVED);
        expect(response.body).toHaveProperty('role', USER_ROLE.MANAGER);
    });

    it('should fail without an authorization header', async () => {
        const response = await api.request.updateUser(targetUser.result.id, {
            email: adminUser.payload.email,
            status: USER_STATUS.ACTIVE,
            role: USER_ROLE.EMPLOYEE,
        });
        expect(response.status).toBe(401);
    });

    it('should fail if a non-admin user attempts to access admin fields', async () => {
        const nonAdminUser = await factory.user({
            role: USER_ROLE.EMPLOYEE,
            status: USER_STATUS.ACTIVE,
        });
        const nonAdminLoginRes = await api.request.login({
            email: nonAdminUser.payload.email,
            password: nonAdminUser.payload.password,
        });
        const nonAdminToken = nonAdminLoginRes.body.accessToken;

        const response = await api.request
            .updateUser(targetUser.result.id, {
                status: USER_STATUS.ACTIVE,
                role: USER_ROLE.EMPLOYEE,
            })
            .set('Authorization', `Bearer ${nonAdminToken}`);

        expect(response.status).toBe(403);
    });

    it('should fail if regular user attempts to access manager fields', async () => {
        const nonAdminUser = await factory.user({
            role: USER_ROLE.EMPLOYEE,
            status: USER_STATUS.ACTIVE,
        });
        const nonAdminLoginRes = await api.request.login({
            email: nonAdminUser.payload.email,
            password: nonAdminUser.payload.password,
        });
        const nonAdminToken = nonAdminLoginRes.body.accessToken;

        const response = await api.request
            .updateUser(targetUser.result.id, {
                managerId: nonAdminUser.payload.id,
            })
            .set('Authorization', `Bearer ${nonAdminToken}`);

        expect(response.status).toBe(403);
    });

    it('should fail if regular user attempts to access other users field', async () => {
        const nonAdminUser = await factory.user({
            role: USER_ROLE.EMPLOYEE,
            status: USER_STATUS.ACTIVE,
        });
        const nonAdminLoginRes = await api.request.login({
            email: nonAdminUser.payload.email,
            password: nonAdminUser.payload.password,
        });
        const nonAdminToken = nonAdminLoginRes.body.accessToken;

        const response = await api.request
            .updateUser(targetUser.result.id, {
                email: 'ExampleMail123@mail.com',
            })
            .set('Authorization', `Bearer ${nonAdminToken}`);

        expect(response.status).toBe(403);
    });

    it('should succeed if regular user attempts to access own field', async () => {
        const nonAdminUser = await factory.user({
            role: USER_ROLE.EMPLOYEE,
            status: USER_STATUS.ACTIVE,
        });
        const nonAdminLoginRes = await api.request.login({
            email: nonAdminUser.payload.email,
            password: nonAdminUser.payload.password,
        });
        const nonAdminToken = nonAdminLoginRes.body.accessToken;
        const newMail = 'A' + nonAdminUser.result.email;
        const response = await api.request
            .updateUser(nonAdminUser.result.id, {
                email: newMail,
            })
            .set('Authorization', `Bearer ${nonAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email', newMail);
    });
});
