import { INestApplication } from '@nestjs/common';
import { USER_ROLE, USER_STATUS } from '../../../src/constants';
import { setupTestApp } from '../../utils/setup-test-app';
import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';
import sinon from 'sinon';
import { CloudinaryService } from '../../../src/modules/shared/database/providers/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { randomBase64 } from '../../utils/randomBase64';

describe('[PUT] /v1/users/:userId', () => {
    let app: INestApplication;
    let api: Api;
    let factory: Factory;
    let cloudinaryServiceMock: sinon.SinonStubbedInstance<CloudinaryService>;
    let adminUser: { result: any; payload: any };
    let adminToken: string;
    let targetUser: { result: any; payload: any };

    beforeAll(async () => {
        const setup = await setupTestApp();
        app = setup.app;
        api = setup.api;
        factory = setup.factory;
        cloudinaryServiceMock = setup.cloudinaryServiceMock; // Using injected mock

        adminUser = await factory.user({
            role: USER_ROLE.ADMIN,
            status: USER_STATUS.ACTIVE,
            avatar: null,
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

    afterEach(() => {
        cloudinaryServiceMock.uploadImage.resetHistory();
        cloudinaryServiceMock.deleteImage.resetHistory();
    });

    it('should update user confirmation successfully with valid token and valid body', async () => {
        const response = await api.request
            .updateUser(targetUser.result.id, {
                status: USER_STATUS.ARCHIVED,
                role: USER_ROLE.MANAGER,
            })
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
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
            .updateUser(nonAdminUser.result.id, { email: newMail })
            .set('Authorization', `Bearer ${nonAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('email', newMail);
    });

    it('should update user avatar and call Cloudinary uploadImage (no old avatar)', async () => {
        cloudinaryServiceMock.uploadImage.resolves({
            secure_url: 'http://fakeurl.com/fake-avatar.jpg',
        } as UploadApiResponse);

        const response = await api.request
            .updateUser(adminUser.result.id, { avatar: randomBase64() })
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('avatar', 'http://fakeurl.com/fake-avatar.jpg');
        expect(cloudinaryServiceMock.uploadImage.calledOnce).toBe(true);
    });

    it('should delete the old avatar and update user avatar when an old avatar exists', async () => {
        const userWithPFP = await factory.user({
            role: USER_ROLE.ADMIN,
            status: USER_STATUS.ACTIVE,
            avatar: 'http://fakeurl.com/fake-avatar-old.jpg',
        });
        const userLoginRes = await api.request.login({
            email: userWithPFP.payload.email,
            password: userWithPFP.payload.password,
        });
        const userWithPFPToken = userLoginRes.body.accessToken;

        cloudinaryServiceMock.deleteImage.resolves({ result: 'ok' });
        cloudinaryServiceMock.uploadImage.resolves({
            secure_url: 'http://fakeurl.com/fake-avatar.jpg',
        } as UploadApiResponse);

        const response = await api.request
            .updateUser(userWithPFP.result.id, { avatar: randomBase64() })
            .set('Authorization', `Bearer ${userWithPFPToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('avatar', 'http://fakeurl.com/fake-avatar.jpg');
        expect(cloudinaryServiceMock.deleteImage.calledOnce).toBe(true);
        expect(cloudinaryServiceMock.uploadImage.calledOnce).toBe(true);
    });

    it('should delete avatar', async () => {
        const userWithPFP = await factory.user({
            role: USER_ROLE.ADMIN,
            status: USER_STATUS.ACTIVE,
            avatar: 'http://fakeurl.com/fake-avatar.jpg',
        });
        const userLoginRes = await api.request.login({
            email: userWithPFP.payload.email,
            password: userWithPFP.payload.password,
        });
        const userWithPFPToken = userLoginRes.body.accessToken;

        cloudinaryServiceMock.deleteImage.resolves({ result: 'ok' });

        const response = await api.request
            .updateUser(userWithPFP.result.id, { avatar: null })
            .set('Authorization', `Bearer ${userWithPFPToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('avatar', null);
        expect(cloudinaryServiceMock.deleteImage.calledOnce).toBe(true);
        expect(cloudinaryServiceMock.uploadImage.called).toBe(false);
    });
});
