import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { BoardingHouse } from './entities/boarding-house.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardingHouseDto } from './dto/create-boarding-house.dto';
import { UpdateBoardingHouseDto } from './dto/update-boarding-house.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { UsersService } from '../users/users.service';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class BoardingHousesService extends BaseService<BoardingHouse> {
  constructor(
    @InjectRepository(BoardingHouse)
    private boardingHouseRepository: Repository<BoardingHouse>,
    private usersService: UsersService,
    protected dataSource: DataSource,
  ) {
    super(boardingHouseRepository, dataSource);
  }

  async create(
    createBoardingHouseDto: CreateBoardingHouseDto,
  ): Promise<BoardingHouse> {
    return this.executeInTransaction(async (queryRunner) => {
      // Validate if owner exists
      try {
        await this.usersService.findOne(createBoardingHouseDto.ownerId);
      } catch (error) {
        throw new BadRequestException(
          `User dengan ID ${createBoardingHouseDto.ownerId} tidak ditemukan`,
        );
      }

      const boardingHouse = this.boardingHouseRepository.create(
        createBoardingHouseDto,
      );
      return queryRunner.manager.save(boardingHouse);
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<BoardingHouse>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.boardingHouseRepository.findAndCount({
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

  async findOne(id: number): Promise<BoardingHouse> {
    const boardingHouse = await this.boardingHouseRepository.findOne({
      where: { id },
    });

    if (!boardingHouse) {
      throw new NotFoundException(`Rumah kos dengan ID ${id} tidak ditemukan`);
    }

    return boardingHouse;
  }

  async update(
    id: number,
    updateBoardingHouseDto: UpdateBoardingHouseDto,
  ): Promise<BoardingHouse> {
    return this.executeInTransaction(async (queryRunner) => {
      const boardingHouse = await this.findOne(id);

      if (updateBoardingHouseDto.ownerId) {
        try {
          await this.usersService.findOne(updateBoardingHouseDto.ownerId);
        } catch (error) {
          throw new BadRequestException(
            `User dengan ID ${updateBoardingHouseDto.ownerId} tidak ditemukan`,
          );
        }
      }

      const updatedBoardingHouse = {
        ...boardingHouse,
        ...updateBoardingHouseDto,
      };

      return queryRunner.manager.save(updatedBoardingHouse);
    });
  }

  async remove(id: number): Promise<void> {
    return this.executeInTransaction(async (queryRunner) => {
      const boardingHouse = await this.findOne(id);
      await queryRunner.manager.remove(boardingHouse);
    });
  }
}
