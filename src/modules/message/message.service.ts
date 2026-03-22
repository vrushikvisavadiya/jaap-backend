import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Model } from 'mongoose';
import { FirebaseService } from './services/firebase.service';
import { DeviceService } from '../device/device.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private readonly firebaseService: FirebaseService,
    private readonly deviceService: DeviceService,
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
    const messages = await this.messageModel
      .find({ createdAt: { $gte: twoDaysAgo } })
      .sort({ createdAt: -1 })
      .exec();

    return {
      messages,
      total: messages.length,
      period: 'Last 2 days',
    };
  }

  // Get scheduled messages
  async getScheduledMessages(now: Date) {
    return this.messageModel.find({
      scheduledAt: { $lte: now },
      isSent: false,
    });
  }

  // Delete messages older than 2 days and not pinned
  async deleteOldMessages() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return this.messageModel.deleteMany({
      createdAt: { $lte: twoDaysAgo },
      isPinned: false,
    });
  }

  /**
   * Send notification to all active devices
   * Automatically handles invalid tokens and saves message to database
   */
  async sendNotificationToAllDevices(dto: SendNotificationDto) {
    const { title, body, link, scheduledAt } = dto;

    // If scheduled for future, save and return
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      if (scheduledDate > new Date()) {
        const message = await this.create({
          message: `${title}: ${body}`,
          title,
          body,
          link,
          scheduledAt: scheduledDate,
          isSent: false,
        });

        return {
          success: true,
          scheduled: true,
          scheduledAt: scheduledDate,
          message: message.message,
        };
      }
    }

    // Get all active FCM tokens
    const activeTokens = await this.deviceService.getAllActiveTokens();

    if (activeTokens.length === 0) {
      return {
        success: false,
        error: 'No active devices found',
        notification: {
          successCount: 0,
          failureCount: 0,
          totalDevices: 0,
        },
      };
    }

    // Send notification via Firebase
    const result = await this.firebaseService.sendNotificationToAll(
      activeTokens,
      title,
      body,
      link,
    );

    // Mark invalid tokens as inactive
    if (result.invalidTokens.length > 0) {
      await Promise.all(
        result.invalidTokens.map((token) =>
          this.deviceService.markTokenAsInactive(token),
        ),
      );
    }

    // Save message to database
    const message = await this.create({
      message: `${title}: ${body}`,
      title,
      body,
      link,
      isSent: true,
      sentAt: new Date(),
    });

    return {
      success: true,
      notification: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        invalidTokens: result.invalidTokens,
        totalDevices: activeTokens.length,
      },
      message: message.message,
    };
  }
}
