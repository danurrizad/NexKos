import { PartialType } from '@nestjs/mapped-types';
import { CreateBoardingHouseDto } from './create-boarding-house.dto';

export class UpdateBoardingHouseDto extends PartialType(CreateBoardingHouseDto) {}
