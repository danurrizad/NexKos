import { Role } from '../../users/enums/role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: Role;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
