import { Module } from '@nestjs/common';
import { BoardingHousesService } from './boarding-houses.service';
import { BoardingHousesController } from './boarding-houses.controller';

@Module({
  controllers: [BoardingHousesController],
  providers: [BoardingHousesService],
})
export class BoardingHousesModule {}
