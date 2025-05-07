import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Role } from '../enums/role.enum';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @ValidateIf((o) => {
    if (o.password) {
      throw new Error(
        'Password tidak dapat diubah melalui endpoint ini. Silakan gunakan endpoint ubah password untuk mengubah password.',
      );
    }
    return false;
  })
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  profilePicture?: string;
}
