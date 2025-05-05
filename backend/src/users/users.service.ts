import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  PaginationOptions,
  PaginatedResult,
} from '../common/interfaces/pagination.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    const user = await this.usersRepository.findOne({ where: { email } });
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }
    const user = await this.usersRepository.findOne({ where: { phone } });
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [{ email: userData.email }, { phone: userData.phone }],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this email or phone already exists',
      );
    }

    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findAll(
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, orderBy = 'id', order = 'ASC' } = options;

    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (limit < 1) {
      throw new BadRequestException('Limit must be greater than 0');
    }

    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('No users found');
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: number): Promise<User> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
