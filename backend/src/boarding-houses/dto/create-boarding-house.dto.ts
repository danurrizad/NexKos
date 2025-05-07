import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateBoardingHouseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  province: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  ownerId: number;
}
