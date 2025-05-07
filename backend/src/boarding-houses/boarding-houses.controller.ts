import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BoardingHousesService } from './boarding-houses.service';
import { CreateBoardingHouseDto } from './dto/create-boarding-house.dto';
import { UpdateBoardingHouseDto } from './dto/update-boarding-house.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { BoardingHouse } from './entities/boarding-house.entity';
import { PaginationOptions } from '../common/interfaces/pagination.interface';

@Controller('boarding-houses')
@UseGuards(JwtAuthGuard)
export class BoardingHousesController {
  constructor(private readonly boardingHousesService: BoardingHousesService) {}

  @Post()
  create(
    @Body() createBoardingHouseDto: CreateBoardingHouseDto,
  ): Promise<BoardingHouse> {
    return this.boardingHousesService.create(createBoardingHouseDto);
  }

  @Get()
  findAll(@Query() options: PaginationOptions) {
    return this.boardingHousesService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BoardingHouse> {
    return this.boardingHousesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBoardingHouseDto: UpdateBoardingHouseDto,
  ): Promise<BoardingHouse> {
    return this.boardingHousesService.update(+id, updateBoardingHouseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.boardingHousesService.remove(+id);
  }
}
