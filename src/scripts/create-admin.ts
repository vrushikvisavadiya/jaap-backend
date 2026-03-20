import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../modules/auth/auth.service';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error('❌ Usage: npm run create-admin <username> <password>');
    process.exit(1);
  }

  try {
    const admin = await authService.createAdmin(username, password);
    console.log('✅ Admin created successfully!');
    console.log('Username:', admin.username);
    console.log('ID:', admin._id);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

createAdmin();
