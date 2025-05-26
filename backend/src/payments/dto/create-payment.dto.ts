import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsEnum,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../enums/payment-method.enum';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  billId: number;

  @IsNotEmpty()
  @IsString()
  transactionReference: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;

  @IsNotEmpty()
  @IsString()
  paymentProof: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amountPaid: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  gatewayName?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
