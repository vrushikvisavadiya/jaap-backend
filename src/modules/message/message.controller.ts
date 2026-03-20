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

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

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
