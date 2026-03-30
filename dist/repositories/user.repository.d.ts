import { Model, FilterQuery } from 'mongoose';
import { IUserDocument, UserStatus } from '../interfaces/user.interface';
export declare class UserRepository {
    private readonly userModel;
    constructor(userModel: Model<IUserDocument>);
    create(userData: Partial<IUserDocument>): Promise<IUserDocument>;
    findOne(query: FilterQuery<IUserDocument>): Promise<IUserDocument | null>;
    findAll(query: FilterQuery<IUserDocument>): Promise<IUserDocument[]>;
    findById(id: string): Promise<IUserDocument | null>;
    findByEmail(email: string): Promise<IUserDocument | null>;
    findByGoogleId(googleId: string): Promise<IUserDocument | null>;
    update(id: string, data: Partial<IUserDocument>): Promise<IUserDocument | null>;
    updateStatus(id: string, status: UserStatus): Promise<IUserDocument | null>;
    search(query: string, currentUserId: string, limit?: number): Promise<IUserDocument[]>;
    getAllExceptCurrent(currentUserId: string): Promise<IUserDocument[]>;
    findByIds(userIds: string[]): Promise<IUserDocument[]>;
    exists(query: FilterQuery<IUserDocument>): Promise<boolean>;
}
