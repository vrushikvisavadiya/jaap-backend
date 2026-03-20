import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { MessageService } from '../modules/message/message.service';
import { FirebaseService } from '../modules/message/services/firebase.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private messageService: MessageService,
    private firebaseService: FirebaseService,
  ) {}

  start() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      this.logger.log('Running scheduled task...');

      // 1️⃣ Send scheduled messages
      const now = new Date();
      const messages = await this.messageService.getScheduledMessages(now);

      for (const msg of messages) {
        // Replace 'userToken' with your actual device token
        await this.firebaseService.sendNotification(
          'userToken',
          'New Message',
          msg.message,
          msg.link,
        );

        msg.isSent = true;
        await msg.save();
      }

      // 2️⃣ Delete old messages (>2 days) except pinned
      await this.messageService.deleteOldMessages();
    });
  }
}
