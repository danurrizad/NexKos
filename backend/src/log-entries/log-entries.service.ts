import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntry } from './entities/log-entry.entity';
import { LogEntryDto } from './dto/log-entry.dto';

@Injectable()
export class LogEntriesService {
  constructor(
    @InjectRepository(LogEntry)
    private logEntriesRepository: Repository<LogEntry>,
  ) {}

  async create(logEntryDto: LogEntryDto): Promise<LogEntry> {
    const logEntry = this.logEntriesRepository.create(logEntryDto);
    return this.logEntriesRepository.save(logEntry);
  }
}
