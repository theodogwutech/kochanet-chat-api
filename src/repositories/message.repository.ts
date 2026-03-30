import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMessageDocument } from 'src/interfaces/message.interface';

/**
 * Message Repository
 * Handles all database operations for Message entity
 */
@Injectable()
export class MessageRepository {
  constructor(
    @InjectModel('Message')
    private readonly messageModel: Model<IMessageDocument>,
  ) {}

  /**
   * Create a new message
   */
  async create(
    messageData: Partial<IMessageDocument>,
  ): Promise<IMessageDocument> {
    const message = new this.messageModel(messageData);
    await message.save();

    // Populate senderId with user details before returning
    const populatedMessage = await this.messageModel
      .findById(message._id)
      .populate('senderId', '-password')
      .exec();

    return populatedMessage || message;
  }

  /**
   * Find message by ID
   */
  async findById(id: string): Promise<IMessageDocument | null> {
    return await this.messageModel.findById(id).exec();
  }

  /**
   * Find messages by chat ID
   */
  async findByChatId(
    chatId: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<IMessageDocument[]> {
    return await this.messageModel
      .find({
        chatId: new Types.ObjectId(chatId),
        isDeleted: false,
      })
      .populate('senderId', '-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get recent messages for a chat
   */
  async getRecentMessages(
    chatId: string,
    limit: number = 20,
  ): Promise<IMessageDocument[]> {
    return await this.messageModel
      .find({
        chatId: new Types.ObjectId(chatId),
        isDeleted: false,
      })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Find messages with specific mention
   */
  async findByMention(
    chatId: string,
    mention: string,
    limit: number = 20,
  ): Promise<IMessageDocument[]> {
    return await this.messageModel
      .find({
        chatId: new Types.ObjectId(chatId),
        mentions: mention,
        isDeleted: false,
      })
      .populate('senderId', '-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Add user to readBy array
   */
  async markAsRead(
    messageId: string,
    userId: string,
  ): Promise<IMessageDocument | null> {
    return await this.messageModel
      .findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: new Types.ObjectId(userId) } },
        { new: true },
      )
      .exec();
  }

  /**
   * Update message
   */
  async update(
    id: string,
    data: Partial<IMessageDocument>,
  ): Promise<IMessageDocument | null> {
    return await this.messageModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  /**
   * Soft delete message
   */
  async softDelete(id: string): Promise<IMessageDocument | null> {
    return await this.messageModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
  }

  /**
   * Count messages in chat
   */
  async countByChatId(chatId: string): Promise<number> {
    return await this.messageModel
      .countDocuments({
        chatId: new Types.ObjectId(chatId),
        isDeleted: false,
      })
      .exec();
  }
}
