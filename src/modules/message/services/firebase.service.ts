import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    const serviceAccountPath = path.resolve(
      process.cwd(),
      process.env.FIREBASE_KEY_PATH || '',
    );

    if (!serviceAccountPath) {
      throw new Error('FIREBASE_KEY_PATH is not defined in .env');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
    });

    this.logger.log('✅ Firebase initialized');
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    link?: string,
  ) {
    const message: admin.messaging.Message = {
      token,
      notification: { title, body },
      android: {
        notification: {
          sound: 'siren.mp3',
        },
      },
      data: link ? { link } : undefined,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent: ${response}`);
      return response;
    } catch (err) {
      this.logger.error('Failed to send notification', err);
    }
  }
}
