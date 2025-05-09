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
import { OccupantsService } from './occupants.service';
import { CreateOccupantDto } from './dto/create-occupant.dto';
import { UpdateOccupantDto } from './dto/update-occupant.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { Occupant } from './entities/occupant.entity';

@Controller('occupants')
export class OccupantsController {
  constructor(private readonly occupantsService: OccupantsService) {}

  @Post()
  create(@Body() createOccupantDto: CreateOccupantDto): Promise<Occupant> {
    return this.occupantsService.create(createOccupantDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<Occupant>> {
    return this.occupantsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Occupant> {
    return this.occupantsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOccupantDto: UpdateOccupantDto,
  ): Promise<Occupant> {
    return this.occupantsService.update(+id, updateOccupantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.occupantsService.remove(+id);
  }
}
