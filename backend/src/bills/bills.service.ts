import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
import { BillStatus } from './enums/bill-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';

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

  private async validateTransactionNumber(
    transactionNumber: string,
    occupantId: number,
  ): Promise<void> {
    // Format: BILL-YYYYMM-RRR-XXX where:
    // YYYYMM: tahun dan bulan
    // RRR: nomor kamar (3 digit)
    // XXX: nomor urut
    const regex = /^BILL-\d{6}-\d{3}-\d{3}$/;
    if (!regex.test(transactionNumber)) {
      throw new BadRequestException(
        'Format nomor transaksi tidak valid. Gunakan format: BILL-YYYYMM-RRR-XXX (contoh: BILL-202403-101-001)',
      );
    }

    // Validasi format tanggal
    const yearMonth = transactionNumber.substring(5, 11);
    const year = parseInt(yearMonth.substring(0, 4));
    const month = parseInt(yearMonth.substring(4, 6));

    if (month < 1 || month > 12) {
      throw new BadRequestException(
        'Bulan dalam nomor transaksi tidak valid (1-12)',
      );
    }

    const currentYear = new Date().getFullYear();
    if (year < currentYear - 1 || year > currentYear + 1) {
      throw new BadRequestException(
        `Tahun dalam nomor transaksi harus antara ${currentYear - 1} sampai ${currentYear + 1}`,
      );
    }

    // Validasi nomor kamar
    const occupant = await this.occupantsService.findOne(occupantId);
    const roomNumber = occupant.room.roomNumber.toString().padStart(3, '0');
    const transactionRoomNumber = transactionNumber.substring(12, 15);

    if (roomNumber !== transactionRoomNumber) {
      throw new BadRequestException(
        `Nomor kamar dalam transaksi (${transactionRoomNumber}) tidak sesuai dengan kamar penghuni (${roomNumber})`,
      );
    }
  }

  private validateMonthYear(month: number, year: number): void {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Bulan harus antara 1-12');
    }

    const currentYear = new Date().getFullYear();
    if (year < currentYear - 1 || year > currentYear + 1) {
      throw new BadRequestException(
        `Tahun harus antara ${currentYear - 1} sampai ${currentYear + 1}`,
      );
    }
  }

  private validateDates(dueDate: Date, issueDate?: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      throw new BadRequestException(
        'Tanggal jatuh tempo tidak boleh kurang dari hari ini',
      );
    }

    if (issueDate && issueDate > dueDate) {
      throw new BadRequestException(
        'Tanggal terbit tidak boleh lebih besar dari tanggal jatuh tempo',
      );
    }
  }

  private validatePaymentMethod(
    status: BillStatus,
    paymentMethod: PaymentMethod,
  ): void {
    // Validasi untuk status belum dibayar
    if (status === BillStatus.Belum_Dibayar && paymentMethod) {
      throw new BadRequestException(
        'Metode pembayaran tidak boleh diisi jika status belum dibayar',
      );
    }

    // Validasi untuk status lunas
    if (status === BillStatus.Lunas && !paymentMethod) {
      throw new BadRequestException(
        'Metode pembayaran harus diisi jika status lunas',
      );
    }
  }

  private async generateTransactionNumber(
    occupantId: number,
    month: number,
    year: number,
  ): Promise<string> {
    // Get occupant data to get room number
    const occupant = await this.occupantsService.findOne(occupantId);
    const roomNumber = occupant.room.roomNumber.toString().padStart(3, '0');

    // Get the last transaction number for this room and month
    const lastBill = await this.billRepository.findOne({
      where: {
        occupant: { id: occupantId },
        month,
        year,
      },
      order: { id: 'DESC' },
    });

    // Generate sequential number
    let sequence = 1;
    if (lastBill) {
      const lastSequence = parseInt(lastBill.transactionNumber.split('-')[3]);
      sequence = lastSequence + 1;
    }

    // Format: BILL-YYYYMM-RRR-XXX
    return `BILL-${year}${month.toString().padStart(2, '0')}-${roomNumber}-${sequence.toString().padStart(3, '0')}`;
  }

  async create(createBillDto: CreateBillDto): Promise<Bill> {
    return this.executeInTransaction(async (queryRunner) => {
      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(
        createBillDto.occupantId,
        createBillDto.month,
        createBillDto.year,
      );

      // Validate month and year
      this.validateMonthYear(createBillDto.month, createBillDto.year);

      // Validate dates
      this.validateDates(createBillDto.dueDate, createBillDto.issueDate);

      // Validate payment method based on status
      this.validatePaymentMethod(
        createBillDto.status,
        createBillDto.paymentMethod,
      );

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
        transactionNumber,
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

      // Validate month and year if provided
      if (updateBillDto.month && updateBillDto.year) {
        this.validateMonthYear(updateBillDto.month, updateBillDto.year);
      }

      // Validate dates if provided
      if (updateBillDto.dueDate) {
        this.validateDates(
          updateBillDto.dueDate,
          updateBillDto.issueDate || bill.issueDate,
        );
      }

      // Validate payment method based on status if both are provided
      if (updateBillDto.status && updateBillDto.paymentMethod) {
        this.validatePaymentMethod(
          updateBillDto.status,
          updateBillDto.paymentMethod,
        );
      }

      // Validate if occupant exists if provided
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
