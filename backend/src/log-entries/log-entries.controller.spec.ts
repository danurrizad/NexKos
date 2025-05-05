import { Test, TestingModule } from '@nestjs/testing';
import { LogEntriesController } from './log-entries.controller';

describe('LogEntriesController', () => {
  let controller: LogEntriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogEntriesController],
    }).compile();

    controller = module.get<LogEntriesController>(LogEntriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
