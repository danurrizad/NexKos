import { IsString, IsOptional, IsEnum } from 'class-validator';
import { FacilityIcon } from '../enum/facility.icon.enum';

export class UpdateFacilityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FacilityIcon)
  @IsOptional()
  icon?: FacilityIcon;
}
