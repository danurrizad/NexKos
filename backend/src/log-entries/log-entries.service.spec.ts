import { Test, TestingModule } from '@nestjs/testing';
import { LogEntriesService } from './log-entries.service';

describe('LogEntriesService', () => {
  let service: LogEntriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogEntriesService],
    }).compile();

    service = module.get<LogEntriesService>(LogEntriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
