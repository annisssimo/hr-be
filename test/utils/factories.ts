import { eq } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';

import { ERROR_MESSAGES, PROVIDERS, USER_ROLE, USER_STATUS } from '../../src/constants';
import { passwordResetTokens, User, users } from '../../src/modules/shared/database/models';

@Injectable()
export class Factory {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase) {}

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
        const hashedPassword = await hash(payload.password, 8);

        const user = await this.drizzle
            .insert(users)
            .values({ ...payload, password: hashedPassword })
            .returning();

        return {
            result: user[0],
            payload,
            dependencies: {},
        };
    }

    public tokenPayload(userId: string) {
        const token = randomUUID();
        const expiresAt = dayjs().add(30, 'minute').toDate();

        return {
            id: randomUUID(),
            userId,
            token,
            expiresAt,
        };
    }

    public async token(userId: string) {
        const payload = this.tokenPayload(userId);

        const token = await this.drizzle.insert(passwordResetTokens).values(payload).returning();

        return {
            result: token[0],
            payload,
            dependencies: {},
        };
    }
}
