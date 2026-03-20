import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const DatabaseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const mongoUri = configService.get<string>('MONGO_URI');
    console.log('mongoUri: ', mongoUri);

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    return {
      uri: mongoUri,
    };
  },
});
