import {
  Body,
  Controller,
  Post,
  Req,
  UseInterceptors,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/auth.register.dto';
import { LoginDto } from './dto/auth.login.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { LoginLoggingInterceptor } from './interceptors/login-logging.interceptor';
import {
  LogoutResponse,
  RefreshTokenDto,
  RequestWithUser,
  TokenResponse,
} from './interfaces/auth.interface';
import { User } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Public()
  // @Roles(Role.ADMIN, Role.OWNER)
  @Roles(Role.OWNER)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @UseInterceptors(LoginLoggingInterceptor)
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshTokenDto.token);
  }

  @Post('logout')
  async logout(@Request() req: { user: User }): Promise<LogoutResponse> {
    return this.authService.logout(req.user.id);
  }
}
