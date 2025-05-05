import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/users/enums/gender.enum';
import { Role } from 'src/users/enums/role.enum';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

  @IsOptional()
  profilePicture: string;
}
