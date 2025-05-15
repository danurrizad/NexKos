import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Icon } from '../enum/icon.enum';

export class CreateFacilityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Icon)
  @IsNotEmpty()
  icon: Icon;
}
