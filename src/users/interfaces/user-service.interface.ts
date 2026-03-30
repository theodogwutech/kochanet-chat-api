import { UserStatus } from 'src/interfaces/user.interface';

/**
 * Get Profile Parameters
 */
export interface GetProfileParams {
  userId: string;
}

/**
 * Update Status Parameters
 */
export interface UpdateStatusParams {
  userId: string;
  status: UserStatus;
}

/**
 * Get All Users Parameters
 */
export interface GetAllUsersParams {
  currentUserId: string;
}

/**
 * Search Users Parameters
 */
export interface SearchUsersParams {
  query: string;
  currentUserId: string;
}
