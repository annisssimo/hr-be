import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { RegisterInputParams } from '../../src/modules/endpoints/auth/register/register.schema';
import { UpdateInputParams } from '../../src/modules/endpoints/userUpdate/user-update.schema';
import { UsersListParams } from '../../src/modules/endpoints/usersList/users-list.schema';

export class Api {
    constructor(private readonly app: INestApplication) {}

    public get request() {
        return {
            register: (data: RegisterInputParams) =>
                request(this.app.getHttpServer()).post('/v1/auth/register').send(data),
            login: (data: { email: string; password: string }) =>
                request(this.app.getHttpServer()).post('/v1/auth/login').send(data),
            usersList: (params?: UsersListParams) =>
                request(this.app.getHttpServer()).post('/v1/users/list').send(params),
            updateUser: (userId: string, data: UpdateInputParams) =>
                request(this.app.getHttpServer()).put(`/v1/users/${userId}`).send(data),
        };
    }
}
