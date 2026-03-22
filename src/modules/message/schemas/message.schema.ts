import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  message: string;

  @Prop()
  title?: string;

  @Prop()
  body?: string;

  @Prop()
  link?: string;

  @Prop({ default: false })
  isPinned: boolean;

  @Prop()
  scheduledAt?: Date;

  @Prop({ default: false })
  isSent: boolean;

  @Prop()
  sentAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
