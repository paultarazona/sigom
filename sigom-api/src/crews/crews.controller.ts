import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrewsService } from './crews.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { UpdateCrewDto } from './dto/update-crew.dto';
import { AddCrewMemberDto } from './dto/add-crew-member.dto';
import { QueryCrewDto } from './dto/query-crew.dto';

@ApiTags('Crews')
@Controller('crews')
export class CrewsController {
  constructor(private readonly crewsService: CrewsService) {}

  @Post()
  create(@Body() dto: CreateCrewDto) {
    return this.crewsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryCrewDto) {
    return this.crewsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.crewsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCrewDto) {
    return this.crewsService.update(id, dto);
  }

  @Post(':id/members')
  addMember(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AddCrewMemberDto) {
    return this.crewsService.addMember(id, dto);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id', ParseUUIDPipe) id: string, @Param('userId', ParseUUIDPipe) userId: string) {
    return this.crewsService.removeMember(id, userId);
  }
}
