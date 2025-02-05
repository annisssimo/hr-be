import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RegisterInputParams } from '../../src/modules/endpoints/auth/register/register.schema';

export class Api {
    constructor(private readonly app: INestApplication) {}

    public get request() {
        return {
            register: (data: RegisterInputParams) =>
                request(this.app.getHttpServer()).post('/v1/auth/register').send(data),
            login: (data: { email: string; password: string }) =>
                request(this.app.getHttpServer()).post('/v1/auth/login').send(data),
        };
    }
}
