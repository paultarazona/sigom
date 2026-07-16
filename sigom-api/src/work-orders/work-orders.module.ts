import { Module } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrdersController } from './work-orders.controller';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  controllers: [WorkOrdersController],
  imports: [IntegrationsModule],
  providers: [WorkOrdersService],
})
export class WorkOrdersModule {}
