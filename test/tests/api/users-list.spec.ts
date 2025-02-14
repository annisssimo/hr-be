import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker/.';

import { setupTestApp } from '../../utils/setup-test-app';
import { USER_ROLE, USER_STATUS } from '../../../src/constants';
import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';
import { User } from '../../../src/modules/shared/database/models';

describe('[POST] /v1/users/list', () => {
    let app: INestApplication;
    let api: Api;
    let factory: Factory;

    beforeAll(async () => {
        ({ app, api, factory } = await setupTestApp());
    });

    afterAll(async () => {
        await app.close();
    });

    it('should return a list of created users', async () => {
        const user1 = await factory.user();
        const user2 = await factory.user();

        const response = await api.request.usersList({
            filters: { id: [user1.result.id, user2.result.id] },
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
    });

    it('should return filtered users by status', async () => {
        const user1 = await factory.user({ status: USER_STATUS.ACTIVE });
        const user2 = await factory.user({ status: USER_STATUS.PENDING });

        const response = await api.request.usersList({
            filters: { id: [user1.result.id, user2.result.id], status: [USER_STATUS.ACTIVE] },
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
    });

    it('should return sorted users by firstName', async () => {
        const user1 = await factory.user({ firstName: 'Zack' });
        const user2 = await factory.user({ firstName: 'Anna' });

        const response = await api.request.usersList({
            filters: { id: [user1.payload.id, user2.payload.id] },
            sort: [{ field: 'firstName', order: 'asc' }],
        });

        expect(response.status).toBe(200);
        expect(response.body.data[0].firstName).toBe('Anna');
        expect(response.body.data[1].firstName).toBe('Zack');
    });

    it('should return an empty list if no users match the filters', async () => {
        const response = await api.request.usersList({
            filters: { id: [faker.string.uuid()] },
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(0);
    });

    it('should return paginated results', async () => {
        const user1 = await factory.user();
        const user2 = await factory.user();

        const response = await api.request.usersList({
            filters: { id: [user1.payload.id, user2.payload.id] },
            limit: 1,
            offset: 1,
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.metadata.limit).toBe(1);
        expect(response.body.metadata.offset).toBe(1);
    });

    it('should return users matching the search query', async () => {
        const user1 = await factory.user({ firstName: 'John', lastName: 'Doe' });
        const user2 = await factory.user({ firstName: 'Jane', lastName: 'Smith' });

        const response = await api.request.usersList({
            filters: { id: [user1.result.id, user2.result.id] },
            search: 'John',
        });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].firstName).toBe('John');
    });

    it('should return users filtered by role using filtersOr', async () => {
        const admin = await factory.user({ role: USER_ROLE.ADMIN });
        const manager = await factory.user({ role: USER_ROLE.MANAGER });
        const employee = await factory.user({ role: USER_ROLE.EMPLOYEE });

        const response = await api.request.usersList({
            filters: { id: [admin.result.id, manager.result.id, employee.result.id] },
            filtersOr: { isAdmin: true, isManager: true },
        });

        expect(response.status).toBe(200);
        const returnedIds = response.body.data.map((user: User) => user.id);
        expect(returnedIds).toContain(admin.result.id);
        expect(returnedIds).toContain(manager.result.id);
        expect(returnedIds).not.toContain(employee.result.id);
    });

    it('should return sorted users by lastName', async () => {
        const user1 = await factory.user({ lastName: 'Brown' });
        const user2 = await factory.user({ lastName: 'Adams' });

        const response = await api.request.usersList({
            filters: { id: [user1.result.id, user2.result.id] },
            sort: [{ field: 'lastName', order: 'asc' }],
        });

        expect(response.status).toBe(200);
        const lastNames = response.body.data.map((user: User) => user.lastName);
        expect(lastNames).toEqual(['Adams', 'Brown']);
    });

    it('should include total count when includeCount is true', async () => {
        const user1 = await factory.user();
        const user2 = await factory.user();

        const response = await api.request.usersList({
            filters: { id: [user1.result.id, user2.result.id] },
            includeCount: true,
        });

        expect(response.status).toBe(200);
        expect(response.body.metadata.count).toBe(2);
    });
});
