import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { BaseService } from '../common/services/base.service';

@Injectable()
export class FacilitiesService extends BaseService<Facility> {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    protected dataSource: DataSource,
  ) {
    super(facilityRepository, dataSource);
  }

  async create(createFacilityDto: CreateFacilityDto): Promise<Facility> {
    return this.executeInTransaction(async (queryRunner) => {
      const facility = this.facilityRepository.create(createFacilityDto);
      return queryRunner.manager.save(facility);
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Facility>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      order = 'DESC',
    } = paginationQuery;

    const [data, total] = await this.facilityRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        [orderBy]: order,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: number): Promise<Facility> {
    const facility = await this.facilityRepository.findOne({
      where: { id },
    });

    if (!facility) {
      throw new NotFoundException(`Fasilitas dengan ID ${id} tidak ditemukan`);
    }

    return facility;
  }

  async update(
    id: number,
    updateFacilityDto: UpdateFacilityDto,
  ): Promise<Facility> {
    return this.executeInTransaction(async (queryRunner) => {
      const facility = await this.findOne(id);
      Object.assign(facility, updateFacilityDto);
      return queryRunner.manager.save(facility);
    });
  }

  async remove(id: number): Promise<void> {
    return this.executeInTransaction(async (queryRunner) => {
      const facility = await this.findOne(id);
      await queryRunner.manager.remove(facility);
    });
  }

  async findAllForSelection(): Promise<Pick<Facility, 'id' | 'name'>[]> {
    return this.facilityRepository.find({
      select: ['id', 'name'],
      order: {
        name: 'ASC',
      },
    });
  }
}
