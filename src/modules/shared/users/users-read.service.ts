import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SQL, inArray, ilike, or, and, asc, desc, count } from 'drizzle-orm';

import { UsersService } from './users.service';
import { USER_ROLE, SORT_OPTION, PROVIDERS } from '../../../constants';
import { UsersListParams } from '../../endpoints/usersList/users-list.schema';
import { users } from '../database/models/users';

@Injectable()
export class UsersReadService {
    constructor(
        private readonly usersService: UsersService,
        @Inject(PROVIDERS.DRIZZLE) private readonly drizzle: NodePgDatabase,
    ) {}

    public async list(params: UsersListParams) {
        const { includeCount, limit, offset, search, filters, filtersOr, sort } = params;

        const whereOption = this.buildWhereOptions({ search, filters, filtersOr });
        const order = this.buildOrder(sort);

        let count: number | undefined = undefined;
        if (includeCount) {
            count = await this.getUsersCount(whereOption);
        }

        const usersList = await this.drizzle
            .select()
            .from(users)
            .where(whereOption)
            .orderBy(...order)
            .limit(limit ?? 10)
            .offset(offset ?? 0);

        return {
            data: usersList,
            metadata: {
                count,
                limit: limit ?? 10,
                offset: offset ?? 0,
            },
        };
    }

    private async getUsersCount(whereOption?: SQL<unknown>) {
        const countResult = await this.drizzle
            .select({ count: count() })
            .from(users)
            .where(whereOption);

        return countResult[0]?.count ?? undefined;
    }

    private buildWhereOptions({
        search,
        filters,
        filtersOr,
    }: Pick<UsersListParams, 'search' | 'filters' | 'filtersOr'>): SQL | undefined {
        const whereClauses: SQL[] = [];

        if (filters?.id) whereClauses.push(inArray(users.id, filters.id));
        if (filters?.status) whereClauses.push(inArray(users.status, filters.status));
        if (filters?.managerId) whereClauses.push(inArray(users.managerId, filters.managerId));

        if (filtersOr) {
            const roleMapping: Record<string, USER_ROLE> = {
                isAdmin: USER_ROLE.ADMIN,
                isManager: USER_ROLE.MANAGER,
                isEmployee: USER_ROLE.EMPLOYEE,
            };
            const roleFilters = Object.entries(filtersOr)
                .filter(([, value]) => value)
                .map(([key]) => roleMapping[key]);
            if (roleFilters.length) {
                whereClauses.push(inArray(users.role, roleFilters));
            }
        }

        if (search) {
            const searchConditions = [
                ilike(users.firstName, `%${search}%`),
                ilike(users.lastName, `%${search}%`),
                ilike(users.email, `%${search}%`),
            ];

            const orCondition = or(...searchConditions);

            if (orCondition) {
                whereClauses.push(orCondition);
            }
        }

        return whereClauses.length ? and(...whereClauses) : undefined;
    }

    private buildOrder(sort?: { field: string; order: string }[]): SQL[] {
        return (
            sort?.map(({ field, order }) =>
                order === SORT_OPTION.ASC ? asc(users[field]) : desc(users[field]),
            ) ?? [asc(users.id)]
        );
    }
}
