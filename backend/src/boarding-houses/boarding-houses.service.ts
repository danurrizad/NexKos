import { Injectable } from '@nestjs/common';
import { CreateBoardingHouseDto } from './dto/create-boarding-house.dto';
import { UpdateBoardingHouseDto } from './dto/update-boarding-house.dto';

@Injectable()
export class BoardingHousesService {
  create(createBoardingHouseDto: CreateBoardingHouseDto) {
    return 'This action adds a new boardingHouse';
  }

  findAll() {
    return `This action returns all boardingHouses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} boardingHouse`;
  }

  update(id: number, updateBoardingHouseDto: UpdateBoardingHouseDto) {
    return `This action updates a #${id} boardingHouse`;
  }

  remove(id: number) {
    return `This action removes a #${id} boardingHouse`;
  }
}
