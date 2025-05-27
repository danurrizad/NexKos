import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { BillsModule } from '../bills/bills.module';
import { UploadModule } from '../common/services/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), BillsModule, UploadModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
