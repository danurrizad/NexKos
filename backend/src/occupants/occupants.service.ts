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
import { User } from '../users/entities/user.entity';
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

  private async validateNik(
    nik: number,
    currentOccupantId: number,
  ): Promise<void> {
    try {
      const existingNik = await this.occupantRepository.findOne({
        where: { nik, id: Not(currentOccupantId) },
      });
      if (existingNik) {
        throw new BadRequestException('NIK sudah terdaftar');
      }
    } catch (error) {
      console.error('Error in NIK validation:', error);
      throw error;
    }
  }

  private async validateAndGetUser(
    email: string,
    queryRunner: any,
  ): Promise<User> {
    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { email },
      });
      if (!user) {
        throw new NotFoundException(
          `User dengan email ${email} tidak ditemukan`,
        );
      }
      return user;
    } catch (error) {
      console.error('Error in user validation:', error);
      throw error;
    }
  }

  private async validateAndGetRoom(
    roomId: number,
    occupant: Occupant,
    isPrimary?: boolean,
  ): Promise<Room> {
    try {
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
        if (isPrimary !== undefined && isPrimary && !occupant.isPrimary) {
          const hasPrimary = activeOccupants.some((occ) => occ.isPrimary);
          if (hasPrimary) {
            throw new BadRequestException(
              'Kamar sudah memiliki penghuni utama',
            );
          }
        }
      }

      return room;
    } catch (error) {
      console.error('Error in room validation:', error);
      throw error;
    }
  }

  private async validateDates(startDate: Date, endDate?: Date): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        throw new BadRequestException('Tanggal mulai tidak boleh di masa lalu');
      }

      if (endDate && new Date(endDate) <= startDate) {
        throw new BadRequestException(
          'Tanggal selesai harus lebih besar dari tanggal mulai',
        );
      }
    } catch (error) {
      console.error('Error in date validation:', error);
      throw error;
    }
  }

  private async removeRelationUserIfNeeded(
    occupant: Occupant,
    queryRunner: any,
    isPrimary?: boolean,
  ): Promise<void> {
    try {
      if (occupant.isPrimary && isPrimary === false && occupant.user) {
        await queryRunner.manager.update(
          Occupant,
          { id: occupant.id },
          { user: null },
        );
        occupant.user = null;
      }
    } catch (error) {
      console.error('Error in updating user relation:', error);
      throw error;
    }
  }

  async create(createOccupantDto: CreateOccupantDto): Promise<Occupant> {
    return this.executeInTransaction(async (queryRunner) => {
      try {
        const { roomId, emailPayer, ...occupantData } = createOccupantDto;

        // Validasi NIK unik
        await this.validateNik(occupantData.nik, 0);

        // Validasi kamar
        const room = await this.validateAndGetRoom(
          roomId,
          { room: { id: 0 } } as Occupant,
          occupantData.isPrimary,
        );

        // Validasi tanggal
        await this.validateDates(
          new Date(occupantData.startDate),
          occupantData.endDate ? new Date(occupantData.endDate) : undefined,
        );

        const occupant = this.occupantRepository.create(occupantData);
        occupant.room = room;

        // Set user jika emailPayer disediakan
        if (emailPayer) {
          const user = await this.validateAndGetUser(emailPayer, queryRunner);
          occupant.user = user;
        }

        return queryRunner.manager.save(occupant);
      } catch (error) {
        console.error('Error in create transaction:', error);
        throw error;
      }
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Occupant>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.occupantRepository.findAndCount({
      relations: ['user', 'room'],
      select: {
        user: {
          id: true,
          email: true,
        },
      },
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
      try {
        const occupant = await this.findOne(id);
        const { roomId, emailPayer, ...occupantData } = updateOccupantDto;

        // Validasi NIK unik jika NIK diubah
        if (occupantData.nik && occupantData.nik !== occupant.nik) {
          await this.validateNik(occupantData.nik, occupant.id);
        }

        // Update user if emailPayer is provided
        if (emailPayer && emailPayer !== '') {
          const user = await this.validateAndGetUser(emailPayer, queryRunner);
          occupant.user = user;
        }

        // Validasi kamar jika diubah
        if (roomId) {
          const room = await this.validateAndGetRoom(
            roomId,
            occupant,
            occupantData.isPrimary,
          );
          occupant.room = room;
        }

        // Validasi tanggal jika diubah
        if (occupantData.startDate) {
          const occupantStartDateSplit = occupant.startDate
            .toISOString()
            .split('T')[0];
          const occupantBodyStartDateSplit = occupantData.startDate
            ? new Date(occupantData.startDate).toISOString().split('T')[0]
            : null;

          if (
            occupantData.startDate &&
            occupantBodyStartDateSplit !== occupantStartDateSplit
          ) {
            await this.validateDates(
              new Date(occupantData.startDate),
              occupantData.endDate ? new Date(occupantData.endDate) : undefined,
            );
          }
        }

        // Update relasi user menjadi null jika isPrimary berubah dari true ke false
        await this.removeRelationUserIfNeeded(
          occupant,
          queryRunner,
          occupantData.isPrimary,
        );

        Object.assign(occupant, occupantData);
        return queryRunner.manager.save(occupant);
      } catch (error) {
        console.error('Error in update transaction:', error);
        throw error;
      }
    });
  }

  async remove(id: number): Promise<void> {
    return this.executeInTransaction(async (queryRunner) => {
      const occupant = await this.findOne(id);
      await queryRunner.manager.remove(occupant);
    });
  }
}
