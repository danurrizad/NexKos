import { Test, TestingModule } from '@nestjs/testing';
import { BoardingHousesController } from './boarding-houses.controller';
import { BoardingHousesService } from './boarding-houses.service';

describe('BoardingHousesController', () => {
  let controller: BoardingHousesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardingHousesController],
      providers: [BoardingHousesService],
    }).compile();

    controller = module.get<BoardingHousesController>(BoardingHousesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
