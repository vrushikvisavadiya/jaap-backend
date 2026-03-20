import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
  ) {}

  // Admin login
  async login(username: string, password: string) {
    try {
      const admin = await this.adminModel.findOne({ username });
      if (!admin) throw new BadRequestException('Invalid credentials');

      const isMatch: boolean = await bcrypt.compare(password, admin.password);
      if (!isMatch) throw new BadRequestException('Invalid credentials');

      return {
        token: this.jwtService.sign({
          id: admin._id,
          username: admin.username,
        }),
      };
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Login failed',
      );
    }
  }

  // Create initial admin
  async createAdmin(username: string, password: string) {
    try {
      const hash: string = await bcrypt.hash(password, 12);
      return this.adminModel.create({ username, password: hash });
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Admin creation failed',
      );
    }
  }
}
