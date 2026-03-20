import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { MessageModule } from './modules/message/message.module';
import { SchedulerService } from './cron/scheduler.service';
import { FirebaseService } from './modules/message/services/firebase.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseConfig,
    AuthModule,
    MessageModule,
  ],
  providers: [SchedulerService, FirebaseService],
})
export class AppModule implements OnModuleInit {
  constructor(private schedulerService: SchedulerService) {}

  onModuleInit() {
    this.schedulerService.start();
  }
}
