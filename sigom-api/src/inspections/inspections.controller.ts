import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { QueryInspectionDto } from './dto/query-inspection.dto';

@ApiTags('Inspections')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  create(@Body() dto: CreateInspectionDto) {
    return this.inspectionsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryInspectionDto) {
    return this.inspectionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inspectionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInspectionDto) {
    return this.inspectionsService.update(id, dto);
  }
}
