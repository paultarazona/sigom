import { buildOrderBy } from './query.utils';

describe('buildOrderBy', () => {
  const ALLOWED_FIELDS = ['createdAt', 'updatedAt', 'code', 'status', 'priority'];

  describe('campo de sort válido', () => {
    it('debe retornar el campo con orden desc por defecto cuando no se especifica sortOrder', () => {
      const result = buildOrderBy('code', undefined, ALLOWED_FIELDS);

      expect(result).toEqual({ code: 'desc' });
    });

    it('debe retornar el campo con orden asc cuando sortOrder es "asc"', () => {
      const result = buildOrderBy('status', 'asc', ALLOWED_FIELDS);

      expect(result).toEqual({ status: 'asc' });
    });

    it('debe retornar el campo con orden desc cuando sortOrder es "desc"', () => {
      const result = buildOrderBy('priority', 'desc', ALLOWED_FIELDS);

      expect(result).toEqual({ priority: 'desc' });
    });

    it('debe retornar orden desc para cualquier valor de sortOrder que no sea "asc"', () => {
      const result = buildOrderBy('createdAt', 'invalid', ALLOWED_FIELDS);

      expect(result).toEqual({ createdAt: 'desc' });
    });
  });

  describe('campo de sort inválido o ausente', () => {
    it('debe retornar el campo por defecto cuando sortBy está en la whitelist', () => {
      const result = buildOrderBy('nonexistent', undefined, ALLOWED_FIELDS);

      expect(result).toEqual({ createdAt: 'desc' });
    });

    it('debe retornar el campo por defecto cuando sortBy es undefined', () => {
      const result = buildOrderBy(undefined, 'asc', ALLOWED_FIELDS);

      expect(result).toEqual({ createdAt: 'desc' });
    });

    it('debe retornar el campo por defecto cuando sortBy es string vacío', () => {
      const result = buildOrderBy('', 'asc', ALLOWED_FIELDS);

      expect(result).toEqual({ createdAt: 'desc' });
    });
  });

  describe('campo por defecto personalizado', () => {
    it('debe usar el defaultField especificado cuando sortBy es inválido', () => {
      const result = buildOrderBy(undefined, 'desc', ALLOWED_FIELDS, 'updatedAt');

      expect(result).toEqual({ updatedAt: 'desc' });
    });

    it('debe usar el defaultField especificado incluso con sortOrder asc', () => {
      const result = buildOrderBy(undefined, 'asc', ALLOWED_FIELDS, 'code');

      expect(result).toEqual({ code: 'desc' });
    });
  });

  describe('whitelist vacía', () => {
    it('debe retornar el campo por defecto cuando la whitelist está vacía', () => {
      const result = buildOrderBy('code', 'asc', []);

      expect(result).toEqual({ createdAt: 'desc' });
    });
  });
});
