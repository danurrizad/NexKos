import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { BillsService } from './bills.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { Bill } from './entities/bill.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('bills')
@Roles(Role.ADMIN)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  create(
    @Body() createBillDto: CreateBillDto,
    @Request() req: { user: User },
  ): Promise<Bill> {
    return this.billsService.create(createBillDto, req.user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.TENANT)
  findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<Bill>> {
    return this.billsService.findAll(paginationDto);
  }

  @Get('deleted')
  findDeleted(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Bill>> {
    return this.billsService.findDeleted(paginationQuery);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TENANT)
  findOne(@Param('id') id: string): Promise<Bill> {
    return this.billsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBillDto: UpdateBillDto,
  ): Promise<Bill> {
    return this.billsService.update(+id, updateBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.billsService.remove(+id);
  }

  @Post('/restore/:id')
  restore(@Param('id') id: string): Promise<Bill> {
    return this.billsService.restore(+id);
  }
}
