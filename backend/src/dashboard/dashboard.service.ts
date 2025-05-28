import { Injectable } from '@nestjs/common';
import { BillsService } from 'src/bills/bills.service';
import { OccupantsService } from 'src/occupants/occupants.service';
import { PaymentsService } from 'src/payments/payments.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { RoomStatus } from 'src/rooms/enums/room.status.enum';
import { Summary } from './interface/summary.interface';
import { PaymentStatus } from 'src/payments/enums/payment-status.enum';
import { Bill } from 'src/bills/entities/bill.entity';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { PaginationQueryDto } from 'src/common/dto/pagination.query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BillStatus } from 'src/bills/enums/bill-status.enum';
import { BillAndPaymentSummary } from './interface/bill-payment.interface';
import { Not, IsNull, Between } from 'typeorm';
import { Payment } from 'src/payments/entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    private readonly occupantService: OccupantsService,
    private readonly billService: BillsService,
    private readonly paymentService: PaymentsService,
    private readonly roomService: RoomsService,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getSummary(): Promise<Summary> {
    const totalOccupants = await this.occupantService.count();
    const totalRooms = await this.roomService.count();
    const totalRoomsOccupied = await this.roomService.count({
      status: RoomStatus.TERISI,
    });
    const totalRoomsAvailable = await this.roomService.count({
      status: RoomStatus.KOSONG,
    });

    return {
      totalOccupants,
      totalRooms,
      totalRoomsOccupied,
      totalRoomsAvailable,
    };
  }

  async getBillRecent(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Bill>> {
    const { page = 1, limit = 5 } = paginationQuery;

    const [data, total] = await this.billRepository.findAndCount({
      where: { isDeleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        status: 'ASC',
        dueDate: 'ASC',
      },
      relations: ['occupant', 'room', 'createdBy'],
      select: {
        occupant: {
          id: true,
          name: true,
          phone: true,
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

  async getBillAndPaymentSummary(
    monthPeriod?: string,
  ): Promise<BillAndPaymentSummary> {
    const currentDate = new Date();
    let startOfMonth: Date;
    let endOfMonth: Date;

    if (monthPeriod) {
      // Parse the monthPeriod string (expected format: YYYY-MM)
      const [year, monthNum] = monthPeriod.split('-').map(Number);
      startOfMonth = new Date(year, monthNum - 1, 1);
      endOfMonth = new Date(year, monthNum, 0);
    } else {
      // If no monthPeriod provided, use current monthPeriod
      startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );
    }

    const totalPayers = await this.occupantService.count({
      isPrimary: true,
      endDate: IsNull(),
    });

    const totalBillsCreated = await this.billService.count({
      isDeleted: false,
      billingPeriod: Between(
        startOfMonth.toISOString().slice(0, 7),
        endOfMonth.toISOString().slice(0, 7),
      ),
    });

    const totalPayments = await this.paymentRepository.sum('amountPaid', {
      isDeleted: false,
      paymentDate: Between(startOfMonth, endOfMonth),
      status: PaymentStatus.Diterima,
    });

    const bills = await this.billRepository.find({
      where: {
        isDeleted: false,
        status: In([BillStatus.Belum_Dibayar, BillStatus.Dibayar_Sebagian]),
        billingPeriod: Between(
          startOfMonth.toISOString().slice(0, 7),
          endOfMonth.toISOString().slice(0, 7),
        ),
      },
      relations: ['payments'],
    });

    const totalUnpaidBills = bills.reduce((total, bill) => {
      const totalPaid = bill.payments.reduce(
        (sum, payment) => sum + Number(payment.amountPaid),
        0,
      );
      return total + (Number(bill.totalAmount) - totalPaid);
    }, 0);

    return {
      totalBillsCreated,
      totalPayers,
      totalPayments: totalPayments || 0,
      totalUnpaidBills: totalUnpaidBills || 0,
    };
  }
}
