import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { FacilityIcon } from '../enum/facility.icon.enum';

export class CreateFacilityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FacilityIcon)
  @IsNotEmpty()
  icon: FacilityIcon;
}
