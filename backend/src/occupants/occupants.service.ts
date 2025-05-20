import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { Occupant } from './entities/occupant.entity';
import { CreateOccupantDto } from './dto/create-occupant.dto';
import { UpdateOccupantDto } from './dto/update-occupant.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BaseService } from '../common/services/base.service';
import { Room } from '../rooms/entities/room.entity';

@Injectable()
export class OccupantsService extends BaseService<Occupant> {
  constructor(
    @InjectRepository(Occupant)
    private readonly occupantRepository: Repository<Occupant>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    protected dataSource: DataSource,
  ) {
    super(occupantRepository, dataSource);
  }

  async create(createOccupantDto: CreateOccupantDto): Promise<Occupant> {
    return this.executeInTransaction(async (queryRunner) => {
      const { roomId, ...occupantData } = createOccupantDto;
      console.log('occupantData', occupantData);

      // Validasi NIK unik
      const existingNik = await this.occupantRepository.findOne({
        where: { nik: occupantData.nik },
      });
      if (existingNik) {
        throw new BadRequestException('NIK sudah terdaftar');
      }

      // Validasi kamar
      const room = await this.roomRepository.findOne({
        where: { id: roomId },
        relations: ['occupants'],
      });
      if (!room) {
        throw new NotFoundException(
          `Kamar dengan ID ${roomId} tidak ditemukan`,
        );
      }

      // Validasi kapasitas kamar
      const activeOccupants = room.occupants.filter((occ) => !occ.endDate);
      if (activeOccupants.length >= room.capacity) {
        throw new BadRequestException('Kamar sudah penuh');
      }

      // Validasi penghuni utama
      if (occupantData.isPrimary) {
        const hasPrimary = activeOccupants.some((occ) => occ.isPrimary);
        if (hasPrimary) {
          throw new BadRequestException('Kamar sudah memiliki penghuni utama');
        }
      }

      // Validasi tanggal
      const startDate = new Date(occupantData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        throw new BadRequestException('Tanggal mulai tidak boleh di masa lalu');
      }

      if (occupantData.endDate && new Date(occupantData.endDate) <= startDate) {
        throw new BadRequestException(
          'Tanggal selesai harus lebih besar dari tanggal mulai',
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

      // Validasi NIK unik jika NIK diubah
      if (occupantData.nik && occupantData.nik !== occupant.nik) {
        const existingNik = await this.occupantRepository.findOne({
          where: { nik: occupantData.nik, id: Not(occupant.id) },
        });
        if (existingNik) {
          throw new BadRequestException('NIK sudah terdaftar');
        }
      }

      // Validasi kamar jika diubah
      if (roomId) {
        const room = await this.roomRepository.findOne({
          where: { id: roomId },
          relations: ['occupants'],
        });
        if (!room) {
          throw new NotFoundException(
            `Kamar dengan ID ${roomId} tidak ditemukan`,
          );
        }

        // Validasi kapasitas kamar (kecuali jika hanya pindah kamar)
        if (room.id !== occupant.room.id) {
          const activeOccupants = room.occupants.filter((occ) => !occ.endDate);
          if (activeOccupants.length >= room.capacity) {
            throw new BadRequestException('Kamar sudah penuh');
          }

          // Validasi penghuni utama jika diubah
          if (occupantData.isPrimary && !occupant.isPrimary) {
            const hasPrimary = activeOccupants.some((occ) => occ.isPrimary);
            if (hasPrimary) {
              throw new BadRequestException(
                'Kamar sudah memiliki penghuni utama',
              );
            }
          }
        }

        occupant.room = room;
      }

      const occupantStartDateSplit = occupant.startDate
        .toISOString()
        .split('T')[0];
      const occupantBodyStartDateSplit = occupantData.startDate
        ? new Date(occupantData.startDate).toISOString().split('T')[0]
        : null;

      // Validasi tanggal hanya jika diubah
      if (
        occupantData.startDate &&
        occupantBodyStartDateSplit !== occupantStartDateSplit
      ) {
        const startDate = new Date(occupantData.startDate);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
          throw new BadRequestException(
            'Tanggal mulai tidak boleh di masa lalu',
          );
        }

        if (
          occupantData.endDate &&
          new Date(occupantData.endDate) <= startDate
        ) {
          throw new BadRequestException(
            'Tanggal selesai harus lebih besar dari tanggal mulai',
          );
        }
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
