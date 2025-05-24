import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsService } from './bills.service';
import { BillsController } from './bills.controller';
import { Bill } from './entities/bill.entity';
import { OccupantsModule } from '../occupants/occupants.module';
import { LogEntriesModule } from '../log-entries/log-entries.module';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill]),
    OccupantsModule,
    LogEntriesModule,
    RoomsModule,
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
