import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaintenancePlansService } from './maintenance-plans.service';
import { CreateMaintenancePlanDto } from './dto/create-maintenance-plan.dto';
import { UpdateMaintenancePlanDto } from './dto/update-maintenance-plan.dto';
import { QueryMaintenancePlanDto } from './dto/query-maintenance-plan.dto';

@ApiTags('Maintenance Plans')
@Controller('maintenance-plans')
export class MaintenancePlansController {
  constructor(private readonly maintenancePlansService: MaintenancePlansService) {}

  @Post()
  create(@Body() dto: CreateMaintenancePlanDto) {
    return this.maintenancePlansService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryMaintenancePlanDto) {
    return this.maintenancePlansService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenancePlansService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMaintenancePlanDto) {
    return this.maintenancePlansService.update(id, dto);
  }
}
