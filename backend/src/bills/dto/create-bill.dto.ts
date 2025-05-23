import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  Min,
  IsOptional,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  billingPeriod: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  occupantId: number;
}
