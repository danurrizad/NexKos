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
import { FacilitiesService } from './facilities.service';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { Facility } from './entities/facility.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('facilities')
@Roles(Role.ADMIN)
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Post()
  create(@Body() createFacilityDto: CreateFacilityDto): Promise<Facility> {
    return this.facilitiesService.create(createFacilityDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<Facility>> {
    return this.facilitiesService.findAll(paginationDto);
  }

  @Get('selection')
  findAllForSelection(): Promise<Pick<Facility, 'id' | 'name'>[]> {
    return this.facilitiesService.findAllForSelection();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Facility> {
    return this.facilitiesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFacilityDto: UpdateFacilityDto,
  ): Promise<Facility> {
    return this.facilitiesService.update(+id, updateFacilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.facilitiesService.remove(+id);
  }
}
