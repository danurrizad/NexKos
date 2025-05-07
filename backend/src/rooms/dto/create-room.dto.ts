import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { Status } from '../enums/status.enum';

export class CreateRoomDto {
  @IsNumber()
  @IsNotEmpty()
  roomNumber: number;

  @IsEnum(Status)
  @IsNotEmpty()
  status: Status;

  @IsNumber()
  @IsOptional()
  floor?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  boardingHouseId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  facilityIds?: number[];
}
