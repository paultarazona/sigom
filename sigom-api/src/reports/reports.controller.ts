import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { ReportDateRangeDto } from './dto/report-date-range.dto';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  summary(@Query() query: ReportDateRangeDto) {
    return this.reportsService.summary(query);
  }

  @Get('work-orders-by-zone')
  workOrdersByZone(@Query() query: ReportDateRangeDto) {
    return this.reportsService.workOrdersByZone(query);
  }

  @Get('average-attention-time')
  averageAttentionTime(@Query() query: ReportDateRangeDto) {
    return this.reportsService.averageAttentionTime(query);
  }

  @Get('technician-workload')
  technicianWorkload(@Query() query: ReportDateRangeDto) {
    return this.reportsService.technicianWorkload(query);
  }

  @Get('common-failures')
  commonFailures(@Query() query: ReportDateRangeDto) {
    return this.reportsService.commonFailures(query);
  }

  @Get('replaced-meters')
  replacedMeters(@Query() query: ReportDateRangeDto) {
    return this.reportsService.replacedMeters(query);
  }
}
