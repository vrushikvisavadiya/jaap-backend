import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { MessageModule } from './modules/message/message.module';
import { DeviceModule } from './modules/device/device.module';
import { SchedulerService } from './cron/scheduler.service';
import { FirebaseService } from './modules/message/services/firebase.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseConfig,
    AuthModule,
    MessageModule,
    DeviceModule,
  ],
  providers: [SchedulerService, FirebaseService],
})
export class AppModule implements OnModuleInit {
  constructor(private schedulerService: SchedulerService) {}

  onModuleInit() {
    this.schedulerService.start();
  }
}
