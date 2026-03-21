import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  /**
   * Register a new device or update existing one
   * Public endpoint - no authentication required
   */
  @Post('register')
  async registerDevice(
    @Body() body: { fcmToken: string; deviceType: 'android' | 'ios' },
  ) {
    return this.deviceService.registerDevice(body.fcmToken, body.deviceType);
  }

  /**
   * Get all active devices (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('active')
  async getActiveDevices() {
    const devices = await this.deviceService.getAllActiveDevices();
    return {
      devices,
      total: devices.length,
    };
  }

  /**
   * Get device statistics (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getDeviceStats() {
    return this.deviceService.getDeviceStats();
  }

  /**
   * Deactivate a device (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':fcmToken')
  async deactivateDevice(@Param('fcmToken') fcmToken: string) {
    return this.deviceService.deactivateDevice(fcmToken);
  }

  /**
   * Clean up inactive devices (Admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Post('cleanup')
  async cleanupInactiveDevices(@Body() body: { daysOld?: number }) {
    const daysOld = body.daysOld || 30;
    return this.deviceService.cleanupInactiveDevices(daysOld);
  }
}
