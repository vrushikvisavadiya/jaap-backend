import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Model } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  // Create message
  async create(data: Partial<Message>) {
    const msg = new this.messageModel(data);
    const savedMsg = await msg.save();
    return {
      message: savedMsg,
    };
  }

  // Get all messages (pinned first)
  async findAll() {
    const messages = await this.messageModel
      .find()
      .sort({ isPinned: -1, createdAt: -1 })
      .exec();

    return {
      messages,
      total: messages.length,
    };
  }

  // Delete message
  async delete(id: string) {
    const msg = await this.messageModel.findByIdAndDelete(id);
    if (!msg) throw new NotFoundException('Message not found');

    return {
      message: msg,
      deleted: true,
    };
  }

  // Pin/unpin
  async togglePin(id: string) {
    const msg = await this.messageModel.findById(id);
    if (!msg) throw new NotFoundException('Message not found');

    msg.isPinned = !msg.isPinned;
    const updatedMsg = await msg.save();

    return {
      message: updatedMsg,
      isPinned: updatedMsg.isPinned,
    };
  }

  // Get messages for admin history (last 2 days)
  async history() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return this.messageModel.find({ createdAt: { $gte: twoDaysAgo } }).exec();
  }
}
