import { Test, TestingModule } from '@nestjs/testing';
import { BoardingHousesService } from './boarding-houses.service';

describe('BoardingHousesService', () => {
  let service: BoardingHousesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardingHousesService],
    }).compile();

    service = module.get<BoardingHousesService>(BoardingHousesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
