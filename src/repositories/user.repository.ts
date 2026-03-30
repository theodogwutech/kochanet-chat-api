import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { IUserDocument, UserStatus } from '../interfaces/user.interface';

/**
 * User Repository
 * Handles all database operations for User entity
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<IUserDocument>,
  ) {}

  /**
   * Create a new user
   */
  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const [user] = await this.userModel.create([userData]);
    return user;
  }

  /**
   * Find a single user by query
   */
  async findOne(
    query: FilterQuery<IUserDocument>,
  ): Promise<IUserDocument | null> {
    return await this.userModel.findOne(query).exec();
  }

  /**
   * Find all users matching query
   */
  async findAll(query: FilterQuery<IUserDocument>): Promise<IUserDocument[]> {
    return await this.userModel.find(query).exec();
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUserDocument | null> {
    return await this.userModel.findById(id).select('-password').exec();
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await this.userModel
      .findOne({
        email: email.toLowerCase().trim(),
      })
      .exec();
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<IUserDocument | null> {
    return await this.userModel.findOne({ googleId }).exec();
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: Partial<IUserDocument>,
  ): Promise<IUserDocument | null> {
    return await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .exec();
  }

  /**
   * Update user status
   */
  async updateStatus(
    id: string,
    status: UserStatus,
  ): Promise<IUserDocument | null> {
    return await this.userModel
      .findByIdAndUpdate(id, { status, lastSeen: new Date() }, { new: true })
      .select('-password')
      .exec();
  }

  /**
   * Search users by name or email
   */
  async search(
    query: string,
    currentUserId: string,
    limit: number = 10,
  ): Promise<IUserDocument[]> {
    return await this.userModel
      .find({
        _id: { $ne: currentUserId },
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
      .select('-password')
      .limit(limit)
      .exec();
  }

  /**
   * Get all users except current user
   */
  async getAllExceptCurrent(currentUserId: string): Promise<IUserDocument[]> {
    return await this.userModel
      .find({ _id: { $ne: currentUserId }, isActive: true })
      .select('-password')
      .sort({ name: 1 })
      .exec();
  }

  /**
   * Get users by IDs
   */
  async findByIds(userIds: string[]): Promise<IUserDocument[]> {
    return await this.userModel
      .find({ _id: { $in: userIds } })
      .select('-password')
      .exec();
  }

  /**
   * Check if user exists
   */
  async exists(query: FilterQuery<IUserDocument>): Promise<boolean> {
    const count = await this.userModel.countDocuments(query).exec();
    return count > 0;
  }
}
