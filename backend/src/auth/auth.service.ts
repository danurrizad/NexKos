import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/auth.register.dto';
import { LoginDto } from './dto/auth.login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  JwtPayload,
  LogoutResponse,
  TokenResponse,
} from './interfaces/auth.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(data: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('Email sudah terdaftar');
    }

    const hash = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      ...data,
      password: hash,
    });
    return user;
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async refreshToken(token: string): Promise<TokenResponse> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Token tidak valid atau kadaluarsa');
    }

    const tokens = await this.generateTokens(refreshToken.user);
    await this.refreshTokenRepository.remove(refreshToken);
    return tokens;
  }

  private async generateTokens(user: User): Promise<TokenResponse> {
    let payload: JwtPayload;
    // Jika user.name = 'Bagus' maka payload email dan name random
    if (user.name === 'Bagus') {
      const randomString = Math.random().toString(36).substring(2, 8);
      payload = {
        sub: user.id,
        email: `user_${randomString}@nex.id`, // Generate random email
        name: `User_${randomString}`, // Generate random name
        role: user.role,
      };
    } else {
      payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '5s' }),
      this.generateRefreshToken(user),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = this.refreshTokenRepository.create({
      token: uuidv4(),
      user,
      // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      expiresAt: new Date(Date.now() + 10 * 1000), // 10 seconds
    });

    await this.refreshTokenRepository.save(refreshToken);
    return refreshToken.token;
  }

  async logout(userId: number): Promise<LogoutResponse> {
    // Delete all refresh tokens for the user
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('user_id = :userId', { userId })
      .execute();
    return { success: true };
  }
}
