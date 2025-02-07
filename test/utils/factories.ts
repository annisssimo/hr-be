import { faker } from '@faker-js/faker';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import { PROVIDERS, USER_ROLE, USER_STATUS } from '../../src/constants';
import { User, users } from '../../src/modules/shared/database/models';
import { Api } from './api';
import { ERROR_MESSAGES } from '../../src/constants/error-messages';

@Injectable()
export class Factory {
    constructor(
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
        private readonly api: Api,
    ) {}

    public async userPayload(overrides: Partial<User> = {}) {
        return {
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: faker.string.alphanumeric(10) + '1A',
            avatar: faker.image.avatar(),
            status: USER_STATUS.ACTIVE,
            role: USER_ROLE.EMPLOYEE,
            managerId: null,
            statusAssignmentDate: new Date().toISOString(),
            ...overrides,
        };
    }

    public async user(overrides: Partial<User> = {}) {
        const payload = await this.userPayload(overrides);

        const existingUser = await this.drizzle
            .select()
            .from(users)
            .where(eq(users.email, payload.email))
            .limit(1);

        if (existingUser.length > 0) {
            throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
        }

        const user = await this.drizzle.insert(users).values(payload).returning();

        return {
            result: user,
            payload,
            dependencies: {},
        };
    }
}
