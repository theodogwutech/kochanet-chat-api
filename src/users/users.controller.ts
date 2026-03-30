import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IUserDocument, UserStatus } from '../interfaces/user.interface';
import { ResponseUtil } from '../common/utils/response.util';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseUtil: ResponseUtil,
  ) {}

  @Get('profile')
  async getProfile(
    @CurrentUser() user: IUserDocument,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.usersService.getProfile({
      userId: user._id.toString(),
    });

    this.responseUtil.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Patch('status')
  async updateStatus(
    @CurrentUser() user: IUserDocument,
    @Body('status') status: UserStatus,
    @Res() res: Response,
  ): Promise<void> {
    const result: ServiceResponse = await this.usersService.updateStatus({
      userId: user._id.toString(),
      status,
    });

    this.responseUtil.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Get()
  async getAllUsers(
    @CurrentUser() user: IUserDocument,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.usersService.getAllUsers({
      currentUserId: user._id.toString(),
    });

    this.responseUtil.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @CurrentUser() user: IUserDocument,
    @Res() res: Response,
  ): Promise<void> {
    const result: ServiceResponse = await this.usersService.searchUsers({
      query,
      currentUserId: user._id.toString(),
    });

    this.responseUtil.apiResponse({
      res,
      success: result.success,
      code: result.code,
      message: result.message,
      data: result.data,
    });
  }
}
