import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Facility } from 'src/facilities/entities/facility.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BoardingHouse } from 'src/boarding-houses/entities/boarding-house.entity';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class RoomsService extends BaseService<Room> {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(BoardingHouse)
    private readonly boardingHouseRepository: Repository<BoardingHouse>,
    protected dataSource: DataSource,
  ) {
    super(roomRepository, dataSource);
  }

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    return this.executeInTransaction(async (queryRunner) => {
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

      return queryRunner.manager.save(room);
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Room>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'roomNumber',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.roomRepository.findAndCount({
      relations: ['boardingHouse', 'facilities', 'occupants'],
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
    return this.executeInTransaction(async (queryRunner) => {
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
      return queryRunner.manager.save(room);
    });
  }

  async remove(id: number): Promise<void> {
    return this.executeInTransaction(async (queryRunner) => {
      const room = await this.findOne(id);
      await queryRunner.manager.remove(room);
    });
  }

  async findAllForSelection(): Promise<
    Pick<Room, 'id' | 'roomNumber' | 'floor'>[]
  > {
    return this.roomRepository.find({
      select: ['id', 'roomNumber', 'floor'],
      order: {
        roomNumber: 'ASC',
      },
    });
  }
}
