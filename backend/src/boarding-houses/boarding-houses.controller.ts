import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { BoardingHousesService } from './boarding-houses.service';
import { CreateBoardingHouseDto } from './dto/create-boarding-house.dto';
import { UpdateBoardingHouseDto } from './dto/update-boarding-house.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BoardingHouse } from './entities/boarding-house.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('boarding-houses')
@Roles(Role.OWNER, Role.ADMIN)
export class BoardingHousesController {
  constructor(private readonly boardingHousesService: BoardingHousesService) {}

  @Post()
  create(
    @Body() createBoardingHouseDto: CreateBoardingHouseDto,
  ): Promise<BoardingHouse> {
    return this.boardingHousesService.create(createBoardingHouseDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<BoardingHouse>> {
    return this.boardingHousesService.findAll(paginationDto);
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
