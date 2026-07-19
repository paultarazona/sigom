import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateOrderFromIncidentDto } from './dto/create-order-from-incident.dto';
import { Public } from '../auth/decorators/public.decorator';
import { SisconHmacGuard } from './guards/siscon-hmac.guard';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('siscon/work-orders')
  @Public()
  @UseGuards(SisconHmacGuard)
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Clave de idempotencia para evitar duplicados',
    required: true,
  })
  createFromIncident(@Body() dto: CreateOrderFromIncidentDto, @Headers('idempotency-key') idempotencyKey: string) {
    return this.integrationsService.createOrderFromIncident(dto, idempotencyKey);
  }
}
