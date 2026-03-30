import { Injectable, HttpStatus, Inject } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { ServiceResponse } from '../common/interfaces/service-response.interface';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../common/constants';
import {
  GetProfileParams,
  UpdateStatusParams,
  GetAllUsersParams,
  SearchUsersParams,
} from './interfaces/user-service.interface';
import { IUserDocument } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Get user profile
   */
  async getProfile(params: GetProfileParams): Promise<ServiceResponse> {
    const { userId } = params;

    const user = await this.userRepository.findById(userId);

    if (!user) {
      return {
        success: false,
        code: HttpStatus.NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: SUCCESS_MESSAGES.PROFILE_RETRIEVED,
      data: user,
    };
  }

  /**
   * Update user status
   */
  async updateStatus(params: UpdateStatusParams): Promise<ServiceResponse> {
    const { userId, status } = params;

    const user = await this.userRepository.updateStatus(userId, status);

    if (!user) {
      return {
        success: false,
        code: HttpStatus.NOT_FOUND,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: HttpStatus.OK,
      message: SUCCESS_MESSAGES.STATUS_UPDATED,
      data: user,
    };
  }

  /**
   * Get all users except current
   */
  async getAllUsers(params: GetAllUsersParams): Promise<ServiceResponse> {
    const { currentUserId } = params;

    const users = await this.userRepository.getAllExceptCurrent(currentUserId);

    return {
      success: true,
      code: HttpStatus.OK,
      message: SUCCESS_MESSAGES.USERS_RETRIEVED,
      data: users,
    };
  }

  /**
   * Search users
   */
  async searchUsers(params: SearchUsersParams): Promise<ServiceResponse> {
    const { query, currentUserId } = params;

    const users = await this.userRepository.search(query, currentUserId);

    return {
      success: true,
      code: HttpStatus.OK,
      message: SUCCESS_MESSAGES.SEARCH_RESULTS_RETRIEVED,
      data: users,
    };
  }

  /**
   * Get user by ID (internal use)
   */
  async getUserById(userId: string): Promise<IUserDocument | null> {
    return await this.userRepository.findById(userId);
  }

  /**
   * Get users by IDs (internal use)
   */
  async getUsersByIds(userIds: string[]): Promise<IUserDocument[]> {
    return await this.userRepository.findByIds(userIds);
  }
}
