import { eq } from 'drizzle-orm';
import { INestApplication } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { users } from '../../../src/modules/shared/database/models';
import { setupTestApp } from '../../utils/setupTestApp';
import { Api } from '../../utils/api';
import { Factory } from '../../utils/factories';

describe('[POST] api/v1/auth/register', () => {
    let app: INestApplication;
    let api: Api;
    let db: NodePgDatabase;
    let factory: Factory;

    beforeAll(async () => {
        ({ app, api, db, factory } = await setupTestApp());
    });

    afterAll(async () => {
        await app.close();
    });

    it('should register a new user successfully', async () => {
        const payload = await factory.userPayload();
        const result = await api.request.register(payload);

        expect(result.status).toBe(201);

        const [createdUser] = await db.select().from(users).where(eq(users.email, payload.email));
        expect(createdUser).toBeDefined();
    });

    it('should fail when email is already in use', async () => {
        const payload = await factory.userPayload();
        await api.request.register(payload);
        const response = await api.request.register(payload);

        expect(response.status).toBe(409);
    });

    it('should fail when provided invalid data', async () => {
        const payload = await factory.userPayload({ email: 'invalid-email', password: 'short' });
        const response = await api.request.register(payload);

        expect(response.status).toBe(400);
    });
});
