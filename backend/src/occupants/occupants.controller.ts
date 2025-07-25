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
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('occupants')
@Roles(Role.ADMIN)
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

  @Get('selection')
  findAllForSelection(): Promise<
    Pick<Occupant, 'id' | 'name' | 'startDate' | 'room'>[]
  > {
    return this.occupantsService.findAllForSelection();
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
