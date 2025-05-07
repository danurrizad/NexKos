import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Facility } from 'src/facilities/entities/facility.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BoardingHouse } from 'src/boarding-houses/entities/boarding-house.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(BoardingHouse)
    private readonly boardingHouseRepository: Repository<BoardingHouse>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const { facilityIds, boardingHouseId, ...roomData } = createRoomDto;
    const boardingHouse = await this.boardingHouseRepository.findOne({
      where: { id: boardingHouseId },
    });
    if (!boardingHouse) {
      throw new NotFoundException(
        `Rumah Kos dengan ID ${boardingHouseId} tidak ditemukan`,
      );
    }

    const room = this.roomRepository.create(roomData);
    room.boardingHouse = boardingHouse;

    if (facilityIds) {
      const facilities = await this.facilityRepository.findBy({
        id: In(facilityIds),
      });
      if (facilities.length !== facilityIds.length) {
        throw new NotFoundException(
          'Satu atau lebih fasilitas tidak ditemukan',
        );
      }
      room.facilities = facilities;
    }

    return this.roomRepository.save(room);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Room>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'DESC',
    } = paginationQuery;

    const [data, total] = await this.roomRepository.findAndCount({
      relations: ['boardingHouse', 'facilities'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['boardingHouse', 'facilities'],
    });

    if (!room) {
      throw new NotFoundException(`Kamar dengan ID ${id} tidak ditemukan`);
    }

    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    const { facilityIds, ...roomData } = updateRoomDto;

    if (facilityIds) {
      const facilities = await this.facilityRepository.findBy({
        id: In(facilityIds),
      });
      if (facilities.length !== facilityIds.length) {
        throw new NotFoundException(
          'Satu atau lebih fasilitas tidak ditemukan',
        );
      }
      room.facilities = facilities;
    }

    Object.assign(room, roomData);
    return this.roomRepository.save(room);
  }

  async remove(id: number): Promise<void> {
    const room = await this.findOne(id);
    await this.roomRepository.remove(room);
  }
}
