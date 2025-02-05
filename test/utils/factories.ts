import { faker } from '@faker-js/faker';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { stub } from 'sinon';

import { PROVIDERS, USER_ROLE, USER_STATUS } from '../../src/constants';
import { User } from '../../src/modules/shared/database/models';
import { Api } from './api';

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

        const response = await this.api.request.register(payload);

        return {
            result: response,
            payload,
            dependencies: {
                cloudinaryMock: stub(),
            },
        };
    }
}
