import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LogEntryDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsNotEmpty()
  @IsString()
  entity: string;

  @IsNotEmpty()
  @IsNumber()
  entityId: number;

  @IsNotEmpty()
  @IsString()
  oldData: string;

  @IsNotEmpty()
  @IsString()
  newData: string;

  @IsNotEmpty()
  @IsString()
  ipAddress: string;

  @IsNotEmpty()
  @IsString()
  userAgent: string;
}
