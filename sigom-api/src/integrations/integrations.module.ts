import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { SisconHmacGuard } from './guards/siscon-hmac.guard';
import { OutboxService } from './outbox.service';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, SisconHmacGuard, OutboxService],
  exports: [OutboxService],
})
export class IntegrationsModule {}
