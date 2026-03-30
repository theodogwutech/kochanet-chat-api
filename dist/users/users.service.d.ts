import { UserRepository } from '../repositories/user.repository';
import { ServiceResponse } from '../common/interfaces/service-response.interface';
import { GetProfileParams, UpdateStatusParams, GetAllUsersParams, SearchUsersParams } from './interfaces/user-service.interface';
import { IUserDocument } from '../interfaces/user.interface';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    getProfile(params: GetProfileParams): Promise<ServiceResponse>;
    updateStatus(params: UpdateStatusParams): Promise<ServiceResponse>;
    getAllUsers(params: GetAllUsersParams): Promise<ServiceResponse>;
    searchUsers(params: SearchUsersParams): Promise<ServiceResponse>;
    getUserById(userId: string): Promise<IUserDocument | null>;
    getUsersByIds(userIds: string[]): Promise<IUserDocument[]>;
}
