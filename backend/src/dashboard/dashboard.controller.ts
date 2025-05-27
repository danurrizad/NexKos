import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { DashboardService } from './dashboard.service';
import { Summary } from './interface/summary.interface';
import { PaginatedResponse } from 'src/common/interfaces/pagination.interface';
import { Bill } from 'src/bills/entities/bill.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination.query.dto';
import { BillAndPaymentSummary } from './interface/bill-payment.interface';
@Controller('dashboard')
@Roles(Role.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(): Promise<Summary> {
    return this.dashboardService.getSummary();
  }

  @Get('bill-recent')
  getBillRecent(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Bill>> {
    return this.dashboardService.getBillRecent(paginationQuery);
  }

  @Get('bill-payment-summary')
  getBillAndPaymentSummary(
    @Query('monthPeriod') monthPeriod?: string,
  ): Promise<BillAndPaymentSummary> {
    return this.dashboardService.getBillAndPaymentSummary(monthPeriod);
  }
}
