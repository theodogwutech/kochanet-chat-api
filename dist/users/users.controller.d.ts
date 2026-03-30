import { Response } from 'express';
import { UsersService } from './users.service';
import { IUserDocument, UserStatus } from '../interfaces/user.interface';
import { ResponseUtil } from '../common/utils/response.util';
export declare class UsersController {
    private readonly usersService;
    private readonly responseUtil;
    constructor(usersService: UsersService, responseUtil: ResponseUtil);
    getProfile(user: IUserDocument, res: Response): Promise<void>;
    updateStatus(user: IUserDocument, status: UserStatus, res: Response): Promise<void>;
    getAllUsers(user: IUserDocument, res: Response): Promise<void>;
    searchUsers(query: string, user: IUserDocument, res: Response): Promise<void>;
}
