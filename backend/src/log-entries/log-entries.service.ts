import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntry } from './entities/log-entry.entity';
import { LogEntryDto } from './dto/log-entry.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class LogEntriesService {
  constructor(
    @InjectRepository(LogEntry)
    private logEntriesRepository: Repository<LogEntry>,
    private dataSource: DataSource,
  ) {}

  async create(logEntryDto: LogEntryDto): Promise<LogEntry> {
    const logEntry = this.logEntriesRepository.create(logEntryDto);
    return this.logEntriesRepository.save(logEntry);
  }

  async getEntityData(entity: string, id: number): Promise<any> {
    try {
      const repository = this.dataSource.getRepository(entity);
      return await repository.findOne({ where: { id } });
    } catch (error) {
      console.error(`Error getting data for ${entity} with id ${id}:`, error);
      return null;
    }
  }
}
