import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { Room } from './entities/room.entity';
import { Facility } from 'src/facilities/entities/facility.entity';
import { BoardingHouse } from 'src/boarding-houses/entities/boarding-house.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Facility, BoardingHouse])],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
