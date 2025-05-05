import { Controller, Get, UseGuards, Param, Query } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '../common/dto/pagination.query.dto';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.TENANT)
  async findById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }
}
