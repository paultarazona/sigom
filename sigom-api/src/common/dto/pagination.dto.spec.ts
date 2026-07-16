import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  describe('valores por defecto', () => {
    it('debe asignar page=1 y limit=20 cuando no se envían parámetros', async () => {
      const dto = plainToInstance(PaginationDto, {});

      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
    });
  });

  describe('valores válidos', () => {
    it('debe aceptar page y limit dentro del rango permitido', async () => {
      const dto = plainToInstance(PaginationDto, { page: 3, limit: 50 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(3);
      expect(dto.limit).toBe(50);
    });

    it('debe transformar strings numéricas a números', async () => {
      const dto = plainToInstance(PaginationDto, { page: '5', limit: '10' });

      expect(dto.page).toBe(5);
      expect(dto.limit).toBe(10);
    });
  });

  describe('page inválido', () => {
    it('debe fallar con page menor a 1', async () => {
      const dto = plainToInstance(PaginationDto, { page: 0 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
    });

    it('debe fallar con page negativo', async () => {
      const dto = plainToInstance(PaginationDto, { page: -1 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('page');
    });

    it('debe fallar con page no entero', async () => {
      const dto = plainToInstance(PaginationDto, { page: 1.5 });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('limit inválido', () => {
    it('debe fallar con limit menor a 1', async () => {
      const dto = plainToInstance(PaginationDto, { limit: 0 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('limit');
    });

    it('debe fallar con limit mayor a 100', async () => {
      const dto = plainToInstance(PaginationDto, { limit: 101 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('limit');
    });

    it('debe aceptar limit exactamente 100', async () => {
      const dto = plainToInstance(PaginationDto, { limit: 100 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(100);
    });

    it('debe aceptar limit exactamente 1', async () => {
      const dto = plainToInstance(PaginationDto, { limit: 1 });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(1);
    });
  });
});
