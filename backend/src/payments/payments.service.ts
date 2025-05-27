import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BaseService } from '../common/services/base.service';
import { PaymentStatus } from './enums/payment-status.enum';
import { User } from '../users/entities/user.entity';
import { Bill } from '../bills/entities/bill.entity';
import { BillsService } from '../bills/bills.service';
import { BillStatus } from '../bills/enums/bill-status.enum';

@Injectable()
export class PaymentsService extends BaseService<Payment> {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    protected dataSource: DataSource,
    private billsService: BillsService,
  ) {
    super(paymentRepository, dataSource);
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<Payment> {
    return this.executeInTransaction(async (queryRunner) => {
      // Validate bill exists and get total amount
      const bill = await this.billsService.findOne(createPaymentDto.billId);
      if (!bill) {
        throw new NotFoundException(
          `Bill dengan id ${createPaymentDto.billId} tidak ditemukan`,
        );
      }
      
      // Check if payment amount exceeds remaining bill amount
      const existingPayments = await this.paymentRepository.find({
        where: {
          bill: { id: createPaymentDto.billId },
          status: PaymentStatus.Diterima,
          isDeleted: false,
        },
      });

      const totalPaid = existingPayments.reduce(
        (sum, payment) => sum + Number(payment.amountPaid),
        0,
      );
      const remainingAmount = Number(bill.totalAmount) - totalPaid;

      if (createPaymentDto.amountPaid > remainingAmount) {
        throw new BadRequestException(
          `Jumlah pembayaran melebihi sisa tagihan (Rp ${remainingAmount})`,
        );
      }

      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        status: PaymentStatus.Diterima,
        verifiedBy: user,
        isDeleted: false,
        bill: bill,
      });


      // Update bill status based on payment amount
      const newTotalPaid = totalPaid + Number(createPaymentDto.amountPaid);
      if (newTotalPaid >= Number(bill.totalAmount)) {
        bill.status = BillStatus.Lunas;
      } else {
        bill.status = BillStatus.Dibayar_Sebagian;
      }
      await queryRunner.manager.save(bill);

      // ubah bill status di payment
      payment.bill.status = bill.status;

      return queryRunner.manager.save(payment);
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Payment>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.paymentRepository.findAndCount({
      where: { isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
      relations: ['verifiedBy', 'bill'],
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

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['verifiedBy', 'bill'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.executeInTransaction(async (queryRunner) => {
      const payment = await this.findOne(id);
      const updatedPayment = {
        ...payment,
        ...updatePaymentDto,
      };
      return queryRunner.manager.save(updatedPayment);
    });
  }

  async verifyPayment(
    id: number,
    status: PaymentStatus,
    user: User,
  ): Promise<Payment> {
    return this.executeInTransaction(async (queryRunner) => {
      const payment = await this.findOne(id);

      if (payment.status !== PaymentStatus.Menunggu_Konfirmasi) {
        throw new BadRequestException(
          'Hanya pembayaran yang menunggu konfirmasi yang dapat diverifikasi',
        );
      }

      payment.status = status;
      payment.verifiedBy = user;

      if (status === PaymentStatus.Diterima) {
        await this.billsService.update(payment.bill.id, {
          status: BillStatus.Lunas,
        });
      }

      return queryRunner.manager.save(payment);
    });
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    payment.isDeleted = true;
    payment.deletedAt = new Date();
    await this.paymentRepository.save(payment);
  }

  async restore(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, isDeleted: true },
      relations: ['verifiedBy'],
    });

    if (!payment) {
      throw new NotFoundException(
        `Payment with ID ${id} not found or not in deleted status`,
      );
    }

    payment.isDeleted = false;
    payment.deletedAt = null;
    return this.paymentRepository.save(payment);
  }

  async findDeleted(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Payment>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'id',
      order = 'ASC',
    } = paginationQuery;

    const [data, total] = await this.paymentRepository.findAndCount({
      where: { isDeleted: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
      relations: ['verifiedBy'],
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

  async createSelfPayment(
    createPaymentDto: CreatePaymentDto,
    user: User,
  ): Promise<Payment> {
    return this.executeInTransaction(async (queryRunner) => {
      // Validate bill exists and get total amount
      const bill = await this.billsService.findOne(createPaymentDto.billId);
      if (!bill) {
        throw new NotFoundException(
          `Bill dengan id ${createPaymentDto.billId} tidak ditemukan`,
        );
      }

      // Validate that the bill belongs to the user
      if (bill.occupant.id !== user.id) {
        throw new BadRequestException(
          'Anda tidak memiliki akses untuk membayar tagihan ini',
        );
      }

      // Check if payment amount exceeds remaining bill amount
      const existingPayments = await this.paymentRepository.find({
        where: {
          bill: { id: createPaymentDto.billId },
          status: PaymentStatus.Diterima,
          isDeleted: false,
        },
      });

      const totalPaid = existingPayments.reduce(
        (sum, payment) => sum + Number(payment.amountPaid),
        0,
      );
      const remainingAmount = Number(bill.totalAmount) - totalPaid;

      if (createPaymentDto.amountPaid > remainingAmount) {
        throw new BadRequestException(
          `Jumlah pembayaran melebihi sisa tagihan (Rp ${remainingAmount})`,
        );
      }

      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        status: PaymentStatus.Menunggu_Konfirmasi,
        verifiedBy: undefined,
        isDeleted: false,
        bill: bill,
      });

      return queryRunner.manager.save(payment);
    });
  }
}
