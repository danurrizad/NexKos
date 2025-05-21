import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { Type } from 'class-transformer';
export class CreateOccupantDto {
  @IsNotEmpty()
  @IsNumber()
  nik: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsBoolean()
  isPrimary: boolean;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEmail()
  @IsString()
  emailPayer?: string;

  @IsNotEmpty()
  @IsNumber()
  roomId: number;
}
