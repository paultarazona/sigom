import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { QueryWorkOrderDto } from './dto/query-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { ResolveWorkOrderDto } from './dto/resolve-work-order.dto';
import { CloseWorkOrderDto } from './dto/close-work-order.dto';
import { CancelWorkOrderDto } from './dto/cancel-work-order.dto';

@ApiTags('Work Orders')
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryWorkOrderDto) {
    return this.workOrdersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWorkOrderDto) {
    return this.workOrdersService.update(id, dto);
  }

  @Patch(':id/assign')
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignWorkOrderDto) {
    return this.workOrdersService.assign(id, dto);
  }

  @Patch(':id/start')
  start(@Param('id', ParseUUIDPipe) id: string) {
    return this.workOrdersService.start(id);
  }

  @Patch(':id/suspend')
  suspend(@Param('id', ParseUUIDPipe) id: string) {
    return this.workOrdersService.suspend(id);
  }

  @Patch(':id/resolve')
  resolve(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ResolveWorkOrderDto) {
    return this.workOrdersService.resolve(id, dto);
  }

  @Patch(':id/close')
  close(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CloseWorkOrderDto) {
    return this.workOrdersService.close(id, dto.closedById);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CancelWorkOrderDto) {
    return this.workOrdersService.cancel(id, dto.cancelledById);
  }
}
