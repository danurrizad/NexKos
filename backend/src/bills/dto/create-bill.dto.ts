import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsDate,
  Min,
  IsOptional,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';
import { BillStatus } from '../enums/bill-status.enum';
import { Type } from 'class-transformer';
export class CreateBillDto {
  @IsNotEmpty()
  @IsString()
  transactionNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2000)
  year: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsNotEmpty()
  @IsEnum(BillStatus)
  status: BillStatus;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  issueDate?: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  occupantId: number;
}
