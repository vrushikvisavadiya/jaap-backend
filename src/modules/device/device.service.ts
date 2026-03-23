import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from './schemas/device.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  /**
   * Register or update a device token
   * If token exists, reactivate it
   * If new, create a new record
   */
  async registerDevice(fcmToken: string, deviceType: 'android' | 'ios') {
    // Validate device type
    if (!['android', 'ios'].includes(deviceType)) {
      throw new BadRequestException(
        'Invalid device type. Must be "android" or "ios"',
      );
    }

    // Check if token already exists
    const existingDevice = await this.deviceModel.findOne({ fcmToken });

    if (existingDevice) {
      // Update existing device - reactivate if inactive
      existingDevice.isActive = true;
      existingDevice.deviceType = deviceType;
      const updated = await existingDevice.save();

      return {
        device: {
          id: updated._id,
          fcmToken: updated.fcmToken,
          deviceType: updated.deviceType,
          isActive: updated.isActive,
        },
        isNew: false,
      };
    }

    // Create new device
    const newDevice = await this.deviceModel.create({
      fcmToken,
      deviceType,
      isActive: true,
    });

    return {
      device: {
        id: newDevice._id,
        fcmToken: newDevice.fcmToken,
        deviceType: newDevice.deviceType,
        isActive: newDevice.isActive,
      },
      isNew: true,
    };
  }

  /**
   * Get all active FCM tokens
   * Used for sending notifications to all devices
   */
  async getAllActiveTokens(): Promise<string[]> {
    const activeDevices = await this.deviceModel
      .find({ isActive: true })
      .select('fcmToken')
      .lean()
      .exec();

    return activeDevices.map((device) => device.fcmToken);
  }

  /**
   * Get active FCM tokens filtered by device type
   * @param deviceType - 'android', 'ios', or 'both'
   */
  async getActiveTokensByType(
    deviceType: 'android' | 'ios' | 'both' = 'both',
  ): Promise<string[]> {
    const query: any = { isActive: true };

    // Add device type filter if not 'both'
    if (deviceType !== 'both') {
      query.deviceType = deviceType;
    }

    const activeDevices = await this.deviceModel
      .find(query)
      .select('fcmToken')
      .lean()
      .exec();

    return activeDevices.map((device) => device.fcmToken);
  }

  /**
   * Get all active devices with full details
   */
  async getAllActiveDevices(): Promise<DeviceDocument[]> {
    return this.deviceModel.find({ isActive: true }).exec();
  }

  /**
   * Mark a token as inactive
   * Called when Firebase returns invalid token error
   */
  async markTokenAsInactive(fcmToken: string): Promise<void> {
    await this.deviceModel.updateOne(
      { fcmToken },
      { $set: { isActive: false } },
    );
  }

  /**
   * Deactivate a device (soft delete)
   */
  async deactivateDevice(fcmToken: string) {
    const device = await this.deviceModel.findOne({ fcmToken });

    if (!device) {
      throw new BadRequestException('Device not found');
    }

    device.isActive = false;
    await device.save();

    return {
      device: {
        id: device._id,
        fcmToken: device.fcmToken,
        isActive: device.isActive,
      },
    };
  }

  /**
   * Get device statistics
   */
  async getDeviceStats() {
    const [total, active, inactive, android, ios] = await Promise.all([
      this.deviceModel.countDocuments(),
      this.deviceModel.countDocuments({ isActive: true }),
      this.deviceModel.countDocuments({ isActive: false }),
      this.deviceModel.countDocuments({
        deviceType: 'android',
        isActive: true,
      }),
      this.deviceModel.countDocuments({ deviceType: 'ios', isActive: true }),
    ]);

    return {
      total,
      active,
      inactive,
      byPlatform: {
        android,
        ios,
      },
    };
  }

  /**
   * Clean up inactive devices older than specified days
   */
  async cleanupInactiveDevices(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deviceModel.deleteMany({
      isActive: false,
      updatedAt: { $lt: cutoffDate },
    });

    return {
      deletedCount: result.deletedCount,
    };
  }
}
