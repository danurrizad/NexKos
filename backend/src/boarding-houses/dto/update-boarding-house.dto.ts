import { IsString, IsNumber, IsArray, Min, IsOptional } from 'class-validator';

export class UpdateBoardingHouseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  province?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ownerId?: number;
}
