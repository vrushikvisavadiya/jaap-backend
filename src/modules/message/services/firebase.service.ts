import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';

export interface NotificationResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  results: {
    token: string;
    success: boolean;
    error?: string;
  }[];
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor() {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
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
    } else {
      this.logger.log('✅ Firebase already initialized, reusing existing app');
    }
  }

  /**
   * Send notification to a single token
   * @deprecated Use sendNotificationToMultiple for better error handling
   */
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
      throw err;
    }
  }

  /**
   * Send notification to multiple tokens
   * Returns detailed results including invalid tokens
   */
  async sendNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    link?: string,
  ): Promise<NotificationResult> {
    if (!tokens || tokens.length === 0) {
      this.logger.warn('No tokens provided for notification');
      return {
        successCount: 0,
        failureCount: 0,
        invalidTokens: [],
        results: [],
      };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      android: {
        notification: {
          sound: 'siren.mp3',
        },
      },
      data: link ? { link } : undefined,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      const invalidTokens: string[] = [];
      const results: NotificationResult['results'] = [];

      response.responses.forEach((resp, idx) => {
        const token = tokens[idx];

        if (resp.success) {
          results.push({
            token,
            success: true,
          });
        } else {
          const errorCode = resp.error?.code;
          const isInvalidToken =
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered';

          if (isInvalidToken) {
            invalidTokens.push(token);
          }

          results.push({
            token,
            success: false,
            error: resp.error?.message || 'Unknown error',
          });
        }
      });

      this.logger.log(
        `Notification sent to ${response.successCount}/${tokens.length} devices`,
      );

      if (invalidTokens.length > 0) {
        this.logger.warn(
          `Found ${invalidTokens.length} invalid tokens: ${invalidTokens.join(', ')}`,
        );
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
        results,
      };
    } catch (err) {
      this.logger.error('Failed to send notifications', err);
      throw err;
    }
  }

  /**
   * Send notification to all provided tokens with batching
   * Handles large number of tokens by splitting into batches
   */
  async sendNotificationToAll(
    tokens: string[],
    title: string,
    body: string,
    link?: string,
  ): Promise<NotificationResult> {
    const BATCH_SIZE = 500; // Firebase limit is 500 tokens per request
    const batches: string[][] = [];

    // Split tokens into batches
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      batches.push(tokens.slice(i, i + BATCH_SIZE));
    }

    this.logger.log(
      `Sending notifications to ${tokens.length} tokens in ${batches.length} batches`,
    );

    // Send to all batches
    const batchResults = await Promise.all(
      batches.map((batch) =>
        this.sendNotificationToMultiple(batch, title, body, link),
      ),
    );

    // Combine results
    const combinedResult: NotificationResult = {
      successCount: 0,
      failureCount: 0,
      invalidTokens: [],
      results: [],
    };

    batchResults.forEach((result) => {
      combinedResult.successCount += result.successCount;
      combinedResult.failureCount += result.failureCount;
      combinedResult.invalidTokens.push(...result.invalidTokens);
      combinedResult.results.push(...result.results);
    });

    this.logger.log(
      `Total: ${combinedResult.successCount} successful, ${combinedResult.failureCount} failed, ${combinedResult.invalidTokens.length} invalid tokens`,
    );

    return combinedResult;
  }
}
