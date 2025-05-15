import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Occupant } from './entities/occupant.entity';
import { CreateOccupantDto } from './dto/create-occupant.dto';
import { UpdateOccupantDto } from './dto/update-occupant.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BaseService } from '../common/services/base.service';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class OccupantsService extends BaseService<Occupant> {
  constructor(
    @InjectRepository(Occupant)
    private readonly occupantRepository: Repository<Occupant>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    protected dataSource: DataSource,
  ) {
    super(occupantRepository, dataSource);
  }

  async create(createOccupantDto: CreateOccupantDto): Promise<Occupant> {
    return this.executeInTransaction(async (queryRunner) => {
      const { roomId, ...occupantData } = createOccupantDto;

      const room = await this.roomRepository.findOne({
        where: { id: roomId },
      });
      if (!room) {
        throw new NotFoundException(
          `Kamar dengan ID ${roomId} tidak ditemukan`,
        );
      }

      const occupant = this.occupantRepository.create(occupantData);
      occupant.room = room;

      return queryRunner.manager.save(occupant);
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Occupant>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'name',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.occupantRepository.findAndCount({
      relations: ['user', 'room'],
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

  async findOne(id: number): Promise<Occupant> {
    const occupant = await this.occupantRepository.findOne({
      where: { id },
      relations: ['user', 'room'],
    });

    if (!occupant) {
      throw new NotFoundException(`Penghuni dengan ID ${id} tidak ditemukan`);
    }

    return occupant;
  }

  async update(
    id: number,
    updateOccupantDto: UpdateOccupantDto,
  ): Promise<Occupant> {
    return this.executeInTransaction(async (queryRunner) => {
      const occupant = await this.findOne(id);
      const { roomId, ...occupantData } = updateOccupantDto;

      if (roomId) {
        const room = await this.roomRepository.findOne({
          where: { id: roomId },
        });
        if (!room) {
          throw new NotFoundException(
            `Kamar dengan ID ${roomId} tidak ditemukan`,
          );
        }
        occupant.room = room;
      }

      Object.assign(occupant, occupantData);
      return queryRunner.manager.save(occupant);
    });
  }

  async remove(id: number): Promise<void> {
    return this.executeInTransaction(async (queryRunner) => {
      const occupant = await this.findOne(id);
      await queryRunner.manager.remove(occupant);
    });
  }
}
