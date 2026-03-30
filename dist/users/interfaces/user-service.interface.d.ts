import { UserStatus } from 'src/interfaces/user.interface';
export interface GetProfileParams {
    userId: string;
}
export interface UpdateStatusParams {
    userId: string;
    status: UserStatus;
}
export interface GetAllUsersParams {
    currentUserId: string;
}
export interface SearchUsersParams {
    query: string;
    currentUserId: string;
}
