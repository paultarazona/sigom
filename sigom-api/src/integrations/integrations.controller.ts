import { Controller, Post, Body, Param, Headers, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiHeader } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateOrderFromIncidentDto } from './dto/create-order-from-incident.dto';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('siscon/incidents/:incidentId/work-orders')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Clave de idempotencia para evitar duplicados',
    required: true,
  })
  createFromIncident(
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Body() dto: CreateOrderFromIncidentDto,
    @Headers('idempotency-key') _idempotencyKey: string,
  ) {
    return this.integrationsService.createOrderFromIncident(incidentId, dto);
  }
}
