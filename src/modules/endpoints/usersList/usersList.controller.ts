import { Controller, Post, Body, UsePipes, HttpCode } from '@nestjs/common';

import { ZodValidationPipe } from '../../validation/validation.pipe';
import { UsersListSchema, UsersListParams } from './usersList.schema';
import { UsersReadService } from '../../shared/users/usersRead.service';
@Controller('v1/users/list')
@UsePipes(new ZodValidationPipe(UsersListSchema))
export class UsersListController {
    constructor(private readonly usersReadService: UsersReadService) {}

    @Post()
    @HttpCode(200)
    public async getUsersList(@Body() body: UsersListParams) {
        return this.usersReadService.list(body);
    }
}
