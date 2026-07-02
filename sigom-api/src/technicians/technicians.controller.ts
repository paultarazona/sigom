import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TechniciansService } from './technicians.service';
import { QueryTechnicianDto } from './dto/query-technician.dto';

@ApiTags('Technicians')
@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  findAll(@Query() query: QueryTechnicianDto) {
    return this.techniciansService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.techniciansService.findOne(id);
  }
}
