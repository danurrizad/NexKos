import { Module } from '@nestjs/common';
import { LogEntriesService } from './log-entries.service';
import { LogEntriesController } from './log-entries.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntry } from './entities/log-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntry])],
  providers: [LogEntriesService],
  controllers: [LogEntriesController],
  exports: [LogEntriesService],
})
export class LogEntriesModule {}
