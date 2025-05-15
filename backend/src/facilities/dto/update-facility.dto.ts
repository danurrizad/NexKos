import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Icon } from '../enum/icon.enum';

export class UpdateFacilityDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Icon)
  @IsOptional()
  icon?: Icon;
}
