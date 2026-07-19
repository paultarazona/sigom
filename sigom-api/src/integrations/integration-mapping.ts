import { BadRequestException } from '@nestjs/common';
import { WorkOrderType } from '@prisma/client';

const INCIDENT_TYPE_MAPPING: Record<string, WorkOrderType> = {
  CONSUMO_ALTO: 'CONSUMPTION_VERIFICATION',
  CONSUMO_BAJO: 'CONSUMPTION_VERIFICATION',
  LECTURA_INVALIDA: 'METER_INSPECTION',
  MEDIDOR_OBSERVADO: 'METER_INSPECTION',
  SIN_LECTURA: 'METER_INSPECTION',
};

export function mapIncidentType(incidentType: string): WorkOrderType {
  const workOrderType = INCIDENT_TYPE_MAPPING[incidentType];
  if (!workOrderType) {
    throw new BadRequestException({
      code: 'UNSUPPORTED_INCIDENT_TYPE',
      message: 'El tipo de incidencia no tiene un mapeo operativo configurado.',
    });
  }
  return workOrderType;
}
