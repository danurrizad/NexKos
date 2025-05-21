import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { OccupantsService } from '../occupants/occupants.service';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class BillsService extends BaseService<Bill> {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    private occupantsService: OccupantsService,
    protected dataSource: DataSource,
  ) {
    super(billRepository, dataSource);
  }

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    return this.executeInTransaction(async (queryRunner) => {
      // Validate if occupant exists
      try {
        await this.occupantsService.findOne(createBillDto.occupantId);
      } catch (error) {
        throw new BadRequestException(
          `Penghuni dengan ID ${createBillDto.occupantId} tidak ditemukan`,
        );
      }

      const bill = this.billRepository.create({
        ...createBillDto,
        occupant: { id: createBillDto.occupantId },
      });
      return queryRunner.manager.save(bill);
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Bill>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.billRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
      relations: ['occupant'],
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

  async findOne(id: number): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { id },
      relations: ['occupant'],
    });

    if (!bill) {
      throw new NotFoundException(`Tagihan dengan ID ${id} tidak ditemukan`);
    }

    return bill;
  }

  async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
    return this.executeInTransaction(async (queryRunner) => {
      const bill = await this.findOne(id);

      if (updateBillDto.occupantId) {
        try {
          await this.occupantsService.findOne(updateBillDto.occupantId);
        } catch (error) {
          throw new BadRequestException(
            `Penghuni dengan ID ${updateBillDto.occupantId} tidak ditemukan`,
          );
        }
      }

      const updatedBill = {
        ...bill,
        ...updateBillDto,
        occupant: updateBillDto.occupantId
          ? { id: updateBillDto.occupantId }
          : bill.occupant,
      };

      return queryRunner.manager.save(updatedBill);
    });
  }

  async remove(id: number): Promise<void> {
    return this.executeInTransaction(async (queryRunner) => {
      const bill = await this.findOne(id);
      await queryRunner.manager.remove(bill);
    });
  }
}
