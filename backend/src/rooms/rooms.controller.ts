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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { Room } from './entities/room.entity';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<Room>> {
    return this.roomsService.findAll(paginationDto);
  }

  @Get('selection')
  findAllForSelection(): Promise<Pick<Room, 'id' | 'roomNumber' | 'floor'>[]> {
    return this.roomsService.findAllForSelection();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Room> {
    return this.roomsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomsService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.roomsService.remove(+id);
  }
}
