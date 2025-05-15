import { Test, TestingModule } from '@nestjs/testing';
import { OccupantsController } from './occupants.controller';
import { OccupantsService } from './occupants.service';

describe('OccupantsController', () => {
  let controller: OccupantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OccupantsController],
      providers: [OccupantsService],
    }).compile();

    controller = module.get<OccupantsController>(OccupantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
