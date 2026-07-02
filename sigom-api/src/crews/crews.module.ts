import { Module } from '@nestjs/common';
import { CrewsService } from './crews.service';
import { CrewsController } from './crews.controller';

@Module({
  controllers: [CrewsController],
  providers: [CrewsService],
})
export class CrewsModule {}
