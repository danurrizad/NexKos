import {
  IsEnum,
  IsOptional,
  IsString,
  IsDate,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../enums/payment-method.enum';

export class UpdatePaymentDto {
  @IsOptional()
  @IsString()
  paymentProof?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paymentDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  gatewayName?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
