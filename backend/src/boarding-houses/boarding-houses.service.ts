import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { BoardingHouse } from './entities/boarding-house.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBoardingHouseDto } from './dto/create-boarding-house.dto';
import { UpdateBoardingHouseDto } from './dto/update-boarding-house.dto';
import { PaginationOptions } from '../common/interfaces/pagination.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class BoardingHousesService {
  constructor(
    @InjectRepository(BoardingHouse)
    private boardingHouseRepository: Repository<BoardingHouse>,
    private usersService: UsersService,
  ) {}

  async create(
    createBoardingHouseDto: CreateBoardingHouseDto,
  ): Promise<BoardingHouse> {
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
    return this.boardingHouseRepository.save(boardingHouse);
  }

  async findAll(
    options: PaginationOptions = {},
  ): Promise<{ data: BoardingHouse[]; pagination: any }> {
    const { page = 1, limit = 10, orderBy = 'id', order = 'ASC' } = options;

    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

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
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
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
    const boardingHouse = await this.findOne(id);

    // Validate if owner exists if ownerId is provided in update
    if (updateBoardingHouseDto.ownerId) {
      try {
        await this.usersService.findOne(updateBoardingHouseDto.ownerId);
      } catch (error) {
        throw new BadRequestException(
          `User dengan ID ${updateBoardingHouseDto.ownerId} tidak ditemukan`,
        );
      }
    }

    return this.boardingHouseRepository.save({
      ...boardingHouse,
      ...updateBoardingHouseDto,
    });
  }

  async remove(id: number): Promise<void> {
    const boardingHouse = await this.findOne(id);
    await this.boardingHouseRepository.remove(boardingHouse);
  }
}
