import { Test, TestingModule } from '@nestjs/testing';
import { OccupantsService } from './occupants.service';

describe('OccupantsService', () => {
  let service: OccupantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OccupantsService],
    }).compile();

    service = module.get<OccupantsService>(OccupantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
