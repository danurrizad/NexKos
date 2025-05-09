import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccupantsService } from './occupants.service';
import { OccupantsController } from './occupants.controller';
import { Occupant } from './entities/occupant.entity';
import { User } from '../users/entities/user.entity';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Occupant, User, Room])],
  controllers: [OccupantsController],
  providers: [OccupantsService],
  exports: [OccupantsService],
})
export class OccupantsModule {}
