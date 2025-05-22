import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BaseService } from '../common/services/base.service';
import { EmailVerificationDto } from './dto/email-verification.dto';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    protected dataSource: DataSource,
  ) {
    super(usersRepository, dataSource);
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new BadRequestException('Email dibutuhkan');
    }
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.executeInTransaction(async (queryRunner) => {
      const existingUser = await this.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new BadRequestException('Email sudah terdaftar');
      }

      const user = this.usersRepository.create(createUserDto);
      return queryRunner.manager.save(user);
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<User>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.usersRepository.findAndCount({
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

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User dengan ID ${id} tidak ditemukan`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.executeInTransaction(async (queryRunner) => {
      const user = await this.findOne(id);

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingEmail = await this.findByEmail(updateUserDto.email);
        if (existingEmail) {
          throw new BadRequestException('Email sudah terdaftar');
        }
      }

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUser = {
        ...user,
        ...updateUserDto,
      };

      return queryRunner.manager.save(updatedUser);
    });
  }

  async remove(id: number): Promise<void> {
    return this.executeInTransaction(async (queryRunner) => {
      const user = await this.findOne(id);
      await queryRunner.manager.remove(user);
    });
  }

  async emailVerification(
    emailVerificationDto: EmailVerificationDto,
  ): Promise<{ exists: boolean }> {
    const user = await this.findByEmail(emailVerificationDto.email);

    if (!user) {
      throw new BadRequestException(
        'User belum terdaftar, silahkan register terlebih dahulu',
      );
    }

    return { exists: true };
  }
}
