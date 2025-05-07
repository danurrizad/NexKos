import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
  ) {}

  async create(createFacilityDto: CreateFacilityDto): Promise<Facility> {
    const facility = this.facilityRepository.create(createFacilityDto);
    return this.facilityRepository.save(facility);
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
    const facility = await this.findOne(id);
    Object.assign(facility, updateFacilityDto);
    return this.facilityRepository.save(facility);
  }

  async remove(id: number): Promise<void> {
    const facility = await this.findOne(id);
    await this.facilityRepository.remove(facility);
  }
}
