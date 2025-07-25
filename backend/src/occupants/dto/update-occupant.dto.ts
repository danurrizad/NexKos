import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../enums/gender.enum';
import { Type } from 'class-transformer';

export class UpdateOccupantDto {
  @IsOptional()
  @IsNumber()
  nik?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  note?: string;

  @ValidateIf((o) => o.emailPayer !== undefined && o.emailPayer !== '')
  @IsEmail()
  @IsString()
  emailPayer?: string;

  @IsOptional()
  @IsNumber()
  roomId?: number;
}
