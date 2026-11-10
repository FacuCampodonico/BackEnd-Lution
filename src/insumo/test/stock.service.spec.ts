import { ConflictException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { Insumo } from '../entities/insumo.entity';
import { Producto } from '../../producto/entities/producto.entity';
import { Receta } from '../../producto/entities/receta.entity';
import {
  STOCK_INSUFICIENTE,
  StockService,
  calcularConsumo,
} from '../stock.service';

function producto(recetas: [insumoId: number, cantidad: number][]): Producto {
  return Object.assign(new Producto(), {
    recetas: recetas.map(([insumoId, cantidad]) =>
      Object.assign(new Receta(), { insumoId, cantidad }),
    ),
  });
}

function insumo(id: number, nombre: string, stock: number): Insumo {
  return Object.assign(new Insumo(), {
    id,
    nombre,
    // MySQL devuelve los decimales como texto.
    stockDisponible: String(stock) as unknown as number,
    unidadMedida: 'G',
  });
}

describe('calcularConsumo', () => {
  it('multiplica la receta por la cantidad y agrupa por insumo', () => {
    const empanada = producto([
      [1, 50],
      [2, 0.125],
    ]);
    const pizza = producto([[1, 200]]);

    const consumo = calcularConsumo([
      { producto: empanada, cantidad: 3 },
      { producto: pizza, cantidad: 1 },
    ]);

    expect([...consumo]).toEqual([
      [1, 350],
      [2, 0.375],
    ]);
  });

  it('redondea a 3 decimales y devuelve en negativo con signo -1', () => {
    const consumo = calcularConsumo(
      [{ producto: producto([[1, 0.1]]), cantidad: 3 }],
      -1,
    );

    expect(consumo.get(1)).toBe(-0.3);
  });

  it('ignora productos sin receta', () => {
    expect(
      calcularConsumo([{ producto: producto([]), cantidad: 2 }]).size,
    ).toBe(0);
  });
});

describe('StockService.ajustar', () => {
  const service = new StockService();
  const repository = { find: jest.fn(), decrement: jest.fn() };
  const manager = {
    getRepository: () => repository,
  } as unknown as EntityManager;

  beforeEach(() => {
    jest.resetAllMocks();
    repository.find.mockResolvedValue([
      insumo(1, 'Queso', 100),
      insumo(2, 'Harina', 1000),
    ]);
  });

  it('descuenta el consumo cuando alcanza el stock', async () => {
    await service.ajustar(
      new Map([
        [1, 100],
        [2, 250],
      ]),
      manager,
    );

    expect(repository.find).toHaveBeenCalledWith(
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
    expect(repository.decrement).toHaveBeenCalledWith(
      { id: 1 },
      'stockDisponible',
      100,
    );
    expect(repository.decrement).toHaveBeenCalledWith(
      { id: 2 },
      'stockDisponible',
      250,
    );
  });

  it('rechaza con el detalle de los faltantes sin tocar el stock', async () => {
    const error = await service
      .ajustar(new Map([[1, 150]]), manager)
      .catch((causa: unknown) => causa);

    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toMatchObject({
      codigo: STOCK_INSUFICIENTE,
      faltantes: [
        {
          insumoId: '1',
          nombre: 'Queso',
          unidad: 'gramos',
          disponible: 100,
          necesario: 150,
        },
      ],
    });
    expect(repository.decrement).not.toHaveBeenCalled();
  });

  it('con permitirSinStock descuenta igual y deja el stock en negativo', async () => {
    await service.ajustar(new Map([[1, 150]]), manager, true);

    expect(repository.decrement).toHaveBeenCalledWith(
      { id: 1 },
      'stockDisponible',
      150,
    );
  });

  it('devuelve stock sin controlar faltantes', async () => {
    repository.find.mockResolvedValue([insumo(1, 'Queso', -20)]);

    await service.ajustar(new Map([[1, -50]]), manager);

    expect(repository.decrement).toHaveBeenCalledWith(
      { id: 1 },
      'stockDisponible',
      -50,
    );
  });

  it('no consulta la base si no hay nada que mover', async () => {
    await service.ajustar(new Map([[1, 0]]), manager);

    expect(repository.find).not.toHaveBeenCalled();
  });
});
