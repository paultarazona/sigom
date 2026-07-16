import { mapIncidentType } from './integration-mapping';

describe('mapIncidentType', () => {
  it.each([
    ['CONSUMO_ALTO', 'CONSUMPTION_VERIFICATION'],
    ['CONSUMO_BAJO', 'CONSUMPTION_VERIFICATION'],
    ['LECTURA_INVALIDA', 'METER_INSPECTION'],
    ['MEDIDOR_OBSERVADO', 'METER_INSPECTION'],
    ['SIN_LECTURA', 'METER_INSPECTION'],
  ])('maps %s to %s', (incidentType, workOrderType) => {
    expect(mapIncidentType(incidentType)).toBe(workOrderType);
  });

  it('rejects unsupported incident types', () => {
    expect(() => mapIncidentType('OTRO')).toThrow(
      expect.objectContaining({
        response: expect.objectContaining({ code: 'UNSUPPORTED_INCIDENT_TYPE' }),
      }),
    );
  });
});
