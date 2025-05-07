import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFacilityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  icon: string;
}
