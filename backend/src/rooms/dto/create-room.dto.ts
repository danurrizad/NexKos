import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNotEmpty,
  Min,
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
  @Min(1)
  @IsNotEmpty()
  floor: number;

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
  @IsOptional()
  boardingHouseId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  facilityIds?: number[];
}
