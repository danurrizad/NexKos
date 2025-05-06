import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BoardingHousesService } from './boarding-houses.service';
import { CreateBoardingHouseDto } from './dto/create-boarding-house.dto';
import { UpdateBoardingHouseDto } from './dto/update-boarding-house.dto';

@Controller('boarding-houses')
export class BoardingHousesController {
  constructor(private readonly boardingHousesService: BoardingHousesService) {}

  @Post()
  create(@Body() createBoardingHouseDto: CreateBoardingHouseDto) {
    return this.boardingHousesService.create(createBoardingHouseDto);
  }

  @Get()
  findAll() {
    return this.boardingHousesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardingHousesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoardingHouseDto: UpdateBoardingHouseDto) {
    return this.boardingHousesService.update(+id, updateBoardingHouseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardingHousesService.remove(+id);
  }
}
