import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { MessageService } from '../modules/message/message.service';
import { FirebaseService } from '../modules/message/services/firebase.service';
import { DeviceService } from '../modules/device/device.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private messageService: MessageService,
    private firebaseService: FirebaseService,
    private deviceService: DeviceService,
  ) {}

  start() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      this.logger.log('Running scheduled task...');

      try {
        // 1️⃣ Send scheduled messages to all active devices
        await this.sendScheduledMessages();

        // 2️⃣ Delete old messages (>2 days) except pinned
        await this.messageService.deleteOldMessages();

        // 3️⃣ Clean up inactive devices (older than 30 days)
        await this.cleanupInactiveDevices();
      } catch (error) {
        this.logger.error('Error in scheduled task:', error);
      }
    });

    this.logger.log('✅ Scheduler started - running every minute');
  }

  /**
   * Send scheduled messages to all active devices
   */
  private async sendScheduledMessages() {
    const now = new Date();
    const messages = await this.messageService.getScheduledMessages(now);

    if (messages.length === 0) {
      return;
    }

    this.logger.log(`Found ${messages.length} scheduled messages to send`);

    // Get all active device tokens
    const activeTokens = await this.deviceService.getAllActiveTokens();

    if (activeTokens.length === 0) {
      this.logger.warn('No active devices found to send notifications');
      return;
    }

    this.logger.log(`Sending to ${activeTokens.length} active devices`);

    // Send each message to all active devices
    for (const msg of messages) {
      try {
        const result = await this.firebaseService.sendNotificationToAll(
          activeTokens,
          'New Message',
          msg.message,
          msg.link,
        );

        // Handle invalid tokens
        if (result.invalidTokens.length > 0) {
          this.logger.warn(
            `Marking ${result.invalidTokens.length} invalid tokens as inactive`,
          );

          // Mark invalid tokens as inactive
          await Promise.all(
            result.invalidTokens.map((token) =>
              this.deviceService.markTokenAsInactive(token),
            ),
          );
        }

        // Mark message as sent
        msg.isSent = true;
        await msg.save();

        this.logger.log(
          `Message sent: ${result.successCount} successful, ${result.failureCount} failed`,
        );
      } catch (error) {
        this.logger.error(`Failed to send message ${String(msg._id)}:`, error);
      }
    }
  }

  /**
   * Clean up inactive devices older than 30 days
   * Runs once per day (only when minute is 0)
   */
  private async cleanupInactiveDevices() {
    const now = new Date();
    if (now.getMinutes() !== 0) {
      return; // Only run at the top of each hour
    }

    try {
      const result = await this.deviceService.cleanupInactiveDevices(30);
      if (result.deletedCount > 0) {
        this.logger.log(
          `Cleaned up ${result.deletedCount} inactive devices older than 30 days`,
        );
      }
    } catch (error) {
      this.logger.error('Error cleaning up inactive devices:', error);
    }
  }
}
