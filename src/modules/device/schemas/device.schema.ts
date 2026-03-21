import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeviceDocument = Device & Document;

@Schema({ timestamps: true })
export class Device {
  @Prop({ required: true, unique: true, index: true })
  fcmToken: string;

  @Prop({ required: true, enum: ['android', 'ios'] })
  deviceType: 'android' | 'ios';

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

// Index for efficient queries
DeviceSchema.index({ isActive: 1, fcmToken: 1 });
