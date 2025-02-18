import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import dayjs from 'dayjs';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { PROVIDERS } from '../../../constants';
import { passwordResetTokens } from '../database/models';

@Injectable()
export class PasswordResetService {
    constructor(@Inject(PROVIDERS.DRIZZLE) private readonly db: NodePgDatabase) {}

    public async generateResetToken(userId: string): Promise<string> {
        const token = randomUUID();
        const expiresAt = dayjs().add(30, 'minute').toDate();

        await this.db.insert(passwordResetTokens).values({ userId, token, expiresAt });

        return token;
    }

    public async validateResetToken(token: string): Promise<string | null> {
        const record = await this.db
            .select()
            .from(passwordResetTokens)
            .where(eq(passwordResetTokens.token, token))
            .limit(1);

        if (!record.length || record[0].expiresAt < new Date()) {
            return null;
        }

        return record[0].userId;
    }

    public async deleteResetToken(token: string) {
        await this.db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    }
}
