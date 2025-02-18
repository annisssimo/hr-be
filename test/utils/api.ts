import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { RegisterInputParams } from '../../src/modules/endpoints/auth/register/register.schema';
import { UpdateInputParams } from '../../src/modules/endpoints/userUpdate/user-update.schema';
import { UsersListParams } from '../../src/modules/endpoints/usersList/users-list.schema';
import { ChangePasswordInputParams } from '../../src/modules/endpoints/profile/changePassword/changePassword.schema';
import { PasswordRequestResetParams } from '../../src/modules/endpoints/auth/passwordRequestReset/passwordRequestReset.schema';
import { LoginInputParameters } from '../../src/modules/endpoints/auth/login/login.schema';
import { PasswordResetParams } from '../../src/modules/endpoints/auth/passwordReset/passwordReset.schema';

export class Api {
    constructor(private readonly app: INestApplication) {}

    public get request() {
        return {
            register: (data: RegisterInputParams) =>
                request(this.app.getHttpServer()).post('/v1/auth/register').send(data),
            login: (data: LoginInputParameters) =>
                request(this.app.getHttpServer()).post('/v1/auth/login').send(data),
            usersList: (params?: UsersListParams) =>
                request(this.app.getHttpServer()).post('/v1/users/list').send(params),
            updateUser: (userId: string, data: UpdateInputParams) =>
                request(this.app.getHttpServer()).put(`/v1/users/${userId}`).send(data),
            changePassword: (data: ChangePasswordInputParams) =>
                request(this.app.getHttpServer()).put('/v1/profile/change-password').send(data),
            passwordRequestReset: (params: PasswordRequestResetParams) =>
                request(this.app.getHttpServer())
                    .post('/v1/auth/password-reset/request')
                    .send(params),
            passwordReset: (params: PasswordResetParams) =>
                request(this.app.getHttpServer()).put('/v1/auth/password-reset/reset').send(params),
        };
    }
}
