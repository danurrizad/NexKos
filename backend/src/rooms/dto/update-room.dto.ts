import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room.dto';
import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Status } from '../enums/status.enum';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @IsNumber()
  @IsOptional()
  roomNumber?: number;

  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  capacity?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  boardingHouseId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  facilityIds?: number[];
}
