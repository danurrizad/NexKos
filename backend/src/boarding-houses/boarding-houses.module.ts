import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardingHousesService } from './boarding-houses.service';
import { BoardingHousesController } from './boarding-houses.controller';
import { BoardingHouse } from './entities/boarding-house.entity';
import { UsersModule } from '../users/users.module';
import { LogEntriesModule } from '../log-entries/log-entries.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardingHouse]),
    UsersModule,
    LogEntriesModule,
  ],
  controllers: [BoardingHousesController],
  providers: [BoardingHousesService],
})
export class BoardingHousesModule {}
