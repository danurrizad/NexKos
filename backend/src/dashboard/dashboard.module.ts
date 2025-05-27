import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Occupant } from 'src/occupants/entities/occupant.entity';
import { Room } from 'src/rooms/entities/room.entity';
import { Bill } from 'src/bills/entities/bill.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { BoardingHouse } from 'src/boarding-houses/entities/boarding-house.entity';
import { OccupantsService } from 'src/occupants/occupants.service';
import { RoomsService } from 'src/rooms/rooms.service';
import { BillsService } from 'src/bills/bills.service';
import { PaymentsService } from 'src/payments/payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Occupant,
      Room,
      Bill,
      Payment,
      Facility,
      BoardingHouse,
    ]),
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    OccupantsService,
    RoomsService,
    BillsService,
    PaymentsService,
  ],
})
export class DashboardModule {}
