import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Message, MessageSchema } from './schemas/message.schema';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'supersecret',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [MessageService, JwtStrategy],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
