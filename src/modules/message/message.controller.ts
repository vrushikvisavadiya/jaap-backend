import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SendNotificationDto } from './dto/send-notification.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  // Admin history - MUST be before :id routes
  @UseGuards(JwtAuthGuard)
  @Get('admin/history')
  async getHistory() {
    return this.messageService.history();
  }

  // Send notification to all active devices
  @UseGuards(JwtAuthGuard)
  @Post('send-notification')
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.messageService.sendNotificationToAllDevices(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: Partial<any>) {
    return this.messageService.create(body);
  }

  @Get()
  async findAll() {
    return this.messageService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.messageService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/pin')
  async togglePin(@Param('id') id: string) {
    return this.messageService.togglePin(id);
  }
}
