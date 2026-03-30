import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { ChatType, IChatDocument } from 'src/interfaces/chat.interface';

/**
 * Chat Repository
 */
@Injectable()
export class ChatRepository {
  constructor(
    @InjectModel('Chat') private readonly chatModel: Model<IChatDocument>,
  ) {}

  /**
   * Create a new chat
   */
  async create(chatData: Partial<IChatDocument>): Promise<IChatDocument> {
    const chat = new this.chatModel(chatData);
    return await chat.save();
  }

  /**
   * Find a single chat by query
   */
  async findOne(
    query: FilterQuery<IChatDocument>,
  ): Promise<IChatDocument | null> {
    return await this.chatModel.findOne(query).exec();
  }

  /**
   * Find chat by ID
   */
  async findById(id: string): Promise<IChatDocument | null> {
    return await this.chatModel.findById(id).exec();
  }

  /**
   * Find chat by ID with populated participants
   */
  async findByIdWithParticipants(id: string): Promise<IChatDocument | null> {
    return await this.chatModel
      .findById(id)
      .populate('participants', '-password')
      .exec();
  }

  /**
   * Find existing direct chat between two users
   */
  async findDirectChat(
    user1Id: string,
    user2Id: string,
  ): Promise<IChatDocument | null> {
    const userIds = [new Types.ObjectId(user1Id), new Types.ObjectId(user2Id)];

    return await this.chatModel
      .findOne({
        type: ChatType.DIRECT,
        participants: { $all: userIds, $size: 2 },
      })
      .exec();
  }

  /**
   * Find all chats for a user
   */
  async findUserChats(userId: string): Promise<IChatDocument[]> {
    return await this.chatModel
      .find({
        participants: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ lastActivity: -1 })
      .exec();
  }

  /**
   * Update chat
   */
  async update(
    id: string,
    data: Partial<IChatDocument>,
  ): Promise<IChatDocument | null> {
    return await this.chatModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  /**
   * Update last activity timestamp
   */
  async updateLastActivity(id: string): Promise<void> {
    await this.chatModel
      .findByIdAndUpdate(id, { lastActivity: new Date() })
      .exec();
  }

  /**
   * Update last message reference
   */
  async updateLastMessage(id: string, messageId: string): Promise<void> {
    await this.chatModel
      .findByIdAndUpdate(id, {
        lastMessage: new Types.ObjectId(messageId),
        lastActivity: new Date(),
      })
      .exec();
  }

  /**
   * Add participants to chat
   */
  async addParticipants(
    id: string,
    participantIds: Types.ObjectId[],
  ): Promise<IChatDocument | null> {
    return await this.chatModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { participants: { $each: participantIds } } },
        { new: true },
      )
      .populate('participants', '-password')
      .exec();
  }

  /**
   * Remove participant from chat
   */
  async removeParticipant(
    id: string,
    userId: string,
  ): Promise<IChatDocument | null> {
    return await this.chatModel
      .findByIdAndUpdate(
        id,
        { $pull: { participants: new Types.ObjectId(userId) } },
        { new: true },
      )
      .exec();
  }

  /**
   * Check if user is participant
   */
  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const chat = await this.chatModel
      .findOne({
        _id: new Types.ObjectId(chatId),
        participants: new Types.ObjectId(userId),
      })
      .exec();

    return !!chat;
  }
}
