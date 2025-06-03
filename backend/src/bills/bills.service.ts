import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { OccupantsService } from '../occupants/occupants.service';
import { BaseService } from '../common/services/base.service';
import { RoomsService } from '../rooms/rooms.service';
import { User } from '../users/entities/user.entity';
import { BillStatus } from './enums/bill-status.enum';
import { Occupant } from 'src/occupants/entities/occupant.entity';
import { ILike } from 'typeorm';

@Injectable()
export class BillsService extends BaseService<Bill> {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
    private occupantsService: OccupantsService,
    private roomsService: RoomsService,
    protected dataSource: DataSource,
  ) {
    super(billRepository, dataSource);
  }

  private validateBillingPeriod(billingPeriod: string): void {
    const [year, month] = billingPeriod.split('-').map(Number);
    if (month < 1 || month > 12) {
      throw new BadRequestException(
        'Bulan dalam periode tagihan tidak valid (1-12)',
      );
    }

    const currentYear = new Date().getFullYear();
    if (year < currentYear - 1 || year > currentYear + 1) {
      throw new BadRequestException(
        `Tahun dalam periode tagihan harus antara ${currentYear - 1} sampai ${currentYear + 1}`,
      );
    }
  }

  private validateDates(dueDate: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      throw new BadRequestException(
        'Tanggal jatuh tempo sudah lewat dari hari ini, periksa kembali tanggal jatuh tempo',
      );
    }
  }

  private async validateOccupant(occupantId: number): Promise<Occupant> {
    try {
      return await this.occupantsService.findOne(occupantId);
    } catch (error) {
      throw new BadRequestException(
        `Penghuni dengan ID ${occupantId} tidak ditemukan`,
      );
    }
  }

  private async validateRoom(roomId: number): Promise<void> {
    try {
      await this.roomsService.findOne(roomId);
    } catch (error) {
      throw new BadRequestException(
        `Kamar dengan ID ${roomId} tidak ditemukan`,
      );
    }
  }

  // private validateBillNumber(billNumber: string): void {
  //   // Validasi format tanggal
  //   const yearMonth = billNumber.substring(5, 11);
  //   const year = parseInt(yearMonth.substring(0, 4));
  //   const month = parseInt(yearMonth.substring(4, 6));

  //   if (month < 1 || month > 12) {
  //     throw new BadRequestException(
  //       'Bulan dalam nomor tagihan tidak valid (1-12)',
  //     );
  //   }

  //   const currentYear = new Date().getFullYear();
  //   if (year < currentYear - 1 || year > currentYear + 1) {
  //     throw new BadRequestException(
  //       `Tahun dalam nomor tagihan harus antara ${currentYear - 1} sampai ${currentYear + 1}`,
  //     );
  //   }
  // }

  private async generateBillNumber(billingPeriod: string): Promise<string> {
    const [year, month] = billingPeriod.split('-').map(Number);
    const yearMonth = `${year}${month.toString().padStart(2, '0')}`;

    // Find the last bill number for current month, including soft-deleted ones
    const lastBill = await this.billRepository
      .createQueryBuilder('bill')
      .where('bill.billNumber LIKE :pattern', {
        pattern: `BILL-${yearMonth}-%`,
      })
      .withDeleted() // Include soft-deleted records
      .orderBy('bill.billNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastBill) {
      // Extract sequence number from last bill number
      const lastSequence = parseInt(lastBill.billNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    // Format: BILL-YYYYMM-XXXX
    // Where XXXX is a 4-digit sequence number
    const billNumber = `BILL-${yearMonth}-${sequence.toString().padStart(4, '0')}`;

    // Double check if the bill number exists (in case of race conditions)
    const existingBill = await this.billRepository
      .createQueryBuilder('bill')
      .where('bill.billNumber = :billNumber', { billNumber })
      .withDeleted() // Include soft-deleted records
      .getOne();

    if (existingBill) {
      // If exists, increment sequence and try again
      return this.generateBillNumber(billingPeriod);
    }

    return billNumber;
  }

  async create(createBillDto: CreateBillDto, user: User): Promise<Bill> {
    return this.executeInTransaction(async (queryRunner) => {
      // Generate bill number
      const billNumber = await this.generateBillNumber(
        createBillDto.billingPeriod,
      );

      // Validate billing period
      this.validateBillingPeriod(createBillDto.billingPeriod);

      // Validate dates
      this.validateDates(createBillDto.dueDate);

      // Validate if occupant exists and get their room
      const occupant = await this.validateOccupant(createBillDto.occupantId);
      await this.validateRoom(occupant.room.id);

      const bill = this.billRepository.create({
        ...createBillDto,
        billNumber,
        totalAmount: occupant.room.price,
        status: BillStatus.Belum_Dibayar,
        occupant: { id: createBillDto.occupantId },
        room: { id: occupant.room.id },
        createdBy: { id: user.id },
        isDeleted: false,
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
      where: { isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
      relations: ['occupant', 'room', 'createdBy', 'payments'],
      select: {
        occupant: {
          id: true,
          name: true,
        },
        room: {
          id: true,
          roomNumber: true,
        },
        createdBy: {
          id: true,
          name: true,
        },
        payments: {
          amountPaid: true,
          paymentDate: true,
          paymentMethod: true,
        },
      },
    });

    // Calculate total amount paid for each bill
    const billsWithTotalPaid = data.map((bill) => ({
      ...bill,
      totalPaid: bill.payments.reduce(
        (sum, payment) => sum + Number(payment.amountPaid),
        0,
      ),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: billsWithTotalPaid,
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
      where: { id, isDeleted: false },
      relations: ['occupant', 'room', 'createdBy', 'payments'],
      select: {
        createdBy: {
          id: true,
          name: true,
          email: true,
        },
      },
    });

    if (!bill) {
      throw new NotFoundException(`Tagihan dengan ID ${id} tidak ditemukan`);
    }

    return bill;
  }

  async update(id: number, updateBillDto: UpdateBillDto): Promise<Bill> {
    return this.executeInTransaction(async (queryRunner) => {
      const bill = await this.findOne(id);

      // Validate dates if provided
      if (updateBillDto.dueDate) {
        this.validateDates(updateBillDto.dueDate);
      }

      Object.assign(bill, updateBillDto);

      return queryRunner.manager.save(bill);
    });
  }

  async remove(id: number): Promise<void> {
    const bill = await this.findOne(id);
    bill.isDeleted = true;
    bill.deletedAt = new Date();
    await this.billRepository.save(bill);
  }

  async restore(id: number): Promise<Bill> {
    const bill = await this.billRepository.findOne({
      where: { id, isDeleted: true },
      relations: ['occupant', 'room', 'createdBy'],
    });

    if (!bill) {
      throw new NotFoundException(
        `Tagihan dengan ID ${id} tidak ditemukan atau tidak dalam status terhapus`,
      );
    }

    bill.isDeleted = false;
    bill.deletedAt = null;
    return this.billRepository.save(bill);
  }

  async findDeleted(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Bill>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.billRepository.findAndCount({
      where: { isDeleted: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
      relations: ['occupant', 'room', 'createdBy'],
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

  async findAllByOccupantId(
    occupantId: number,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Bill>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    // Validate if occupant exists
    await this.validateOccupant(occupantId);

    const [data, total] = await this.billRepository.findAndCount({
      where: {
        occupant: { id: occupantId },
        isDeleted: false,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
      relations: ['occupant', 'room', 'createdBy'],
      select: {
        occupant: {
          id: true,
          name: true,
        },
        room: {
          id: true,
          roomNumber: true,
        },
        createdBy: {
          id: true,
          name: true,
        },
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

  async findAllForSelection(
    billNumber?: string,
  ): Promise<Pick<Bill, 'id' | 'billNumber' | 'billingPeriod' | 'status'>[]> {
    const where: FindOptionsWhere<Bill> = {
      isDeleted: false,
    };

    if (billNumber) {
      where.billNumber = ILike(`%${billNumber}%`);
    }

    return this.billRepository.find({
      select: ['id', 'billNumber', 'billingPeriod', 'status'],
      where,
      order: {
        billNumber: 'ASC',
      },
    });
  }
}
