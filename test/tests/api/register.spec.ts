import { eq } from 'drizzle-orm';

import { users } from '../../../src/modules/shared/database/models';
import { setupTestApp } from '../../utils/setupTestApp';

describe('[POST] api/v1/auth/register', () => {
    const getTestContext = setupTestApp();

    it('should register a new user successfully', async () => {
        const { db, factory } = getTestContext();
        const { result, payload } = await factory.user();

        expect(result.status).toBe(201);

        const [createdUser] = await db.select().from(users).where(eq(users.email, payload.email));
        expect(createdUser).toBeDefined();
    });

    it('should fail when email is already in use', async () => {
        const { api, factory } = getTestContext();
        const { payload } = await factory.user();

        const response = await api.request.register(payload);

        expect(response.status).toBe(409);
    });

    it('should fail when provided invalid data', async () => {
        const { api, factory } = getTestContext();
        const { payload } = await factory.user({ email: 'invalid-email', password: 'short' });

        const response = await api.request.register(payload);

        expect(response.status).toBe(400);
    });
});
