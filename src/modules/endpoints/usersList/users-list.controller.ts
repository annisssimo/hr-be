import { Post, Body, UsePipes, HttpCode, UseGuards } from '@nestjs/common';
import { Controller } from '../../../decorators/controller.decorator';
import { ZodValidationPipe } from '../../validation/validation.pipe';
import { UsersListSchema, UsersListParams } from './users-list.schema';
import { UsersReadService } from '../../shared/users/users-read.service';
import { ControllerGuard } from '../../../guards/controller.guard';

@UseGuards(ControllerGuard)
@Controller('v1/users/list', { requireAuth: true })
@UsePipes(new ZodValidationPipe(UsersListSchema))
export class UsersListController {
    constructor(private readonly usersReadService: UsersReadService) {}

    @Post()
    @HttpCode(200)
    public async getUsersList(@Body() body: UsersListParams) {
        return this.usersReadService.list(body);
    }
}
