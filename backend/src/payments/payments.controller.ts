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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { PaymentStatus } from './enums/payment-status.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { UploadService } from '../common/services/upload.service';

@Controller('payments')
@Roles(Role.ADMIN)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('paymentProof'))
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Payment> {
    if (file) {
      const fileName = await this.uploadService.uploadFile(file);
      createPaymentDto.paymentProof = fileName;
    }
    return this.paymentsService.create(createPaymentDto, req.user);
  }

  @Post('self')
  @Roles(Role.TENANT)
  @UseInterceptors(FileInterceptor('paymentProof'))
  async createSelfPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Payment> {
    if (file) {
      const fileName = await this.uploadService.uploadFile(file);
      createPaymentDto.paymentProof = fileName;
    }
    return this.paymentsService.createSelfPayment(createPaymentDto, req.user);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<Payment>> {
    return this.paymentsService.findAll(paginationDto);
  }

  @Get('deleted')
  findDeleted(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<Payment>> {
    return this.paymentsService.findDeleted(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Post('/verify/:id')
  verifyPayment(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
    @Request() req: { user: User },
  ): Promise<Payment> {
    return this.paymentsService.verifyPayment(+id, status, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.paymentsService.remove(+id);
  }

  @Post('/restore/:id')
  restore(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.restore(+id);
  }

  @Delete('/payment-proof/:id')
  @Roles(Role.ADMIN, Role.TENANT)
  async deletePaymentProof(@Param('id') id: string): Promise<void> {
    const payment = await this.paymentsService.findOne(+id);
    if (payment.paymentProof) {
      await this.uploadService.deleteFile(payment.paymentProof);
      // Update payment to remove payment proof
      await this.paymentsService.update(+id, { paymentProof: null });
    }
  }
}
