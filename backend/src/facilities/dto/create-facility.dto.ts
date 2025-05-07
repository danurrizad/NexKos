import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFacilityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsString()
  icon: string;
}
