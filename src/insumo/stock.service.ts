import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { In, type EntityManager } from 'typeorm';
import { Insumo } from './entities/insumo.entity';
import { unidades } from './dto/insumo-response.dto';
import type { Producto } from '../producto/entities/producto.entity';

export const STOCK_INSUFICIENTE = 'STOCK_INSUFICIENTE';

export interface FaltanteStock {
  insumoId: string;
  nombre: string;
  unidad: string;
  disponible: number;
  necesario: number;
}

/** Consumo por insumo: positivo descuenta stock, negativo lo devuelve. */
export type ConsumoStock = Map<number, number>;

const redondear = (valor: number) => Math.round(valor * 1000) / 1000;

export function calcularConsumo(
  items: { producto: Producto; cantidad: number }[],
  signo: 1 | -1 = 1,
): ConsumoStock {
  const consumo: ConsumoStock = new Map();
  for (const { producto, cantidad } of items) {
    for (const receta of producto.recetas ?? []) {
      const acumulado = consumo.get(receta.insumoId) ?? 0;
      consumo.set(
        receta.insumoId,
        redondear(acumulado + signo * Number(receta.cantidad) * cantidad),
      );
    }
  }
  return consumo;
}

@Injectable()
export class StockService {
  /**
   * Aplica el consumo dentro de la transacción del manager. Si a algún insumo
   * no le alcanza, lanza 409 STOCK_INSUFICIENTE salvo que se permita quedar
   * en negativo.
   */
  async ajustar(
    consumo: ConsumoStock,
    manager: EntityManager,
    permitirSinStock = false,
  ): Promise<void> {
    const cambios = [...consumo].filter(([, cantidad]) => cantidad !== 0);
    if (!cambios.length) return;

    const repository = manager.getRepository(Insumo);
    // El lock evita que dos pedidos simultáneos lean el mismo stock.
    const insumos = await repository.find({
      where: { id: In(cambios.map(([id]) => id)) },
      lock: { mode: 'pessimistic_write' },
    });
    const porId = new Map(insumos.map((insumo) => [insumo.id, insumo]));

    if (!permitirSinStock) {
      const faltantes = cambios.flatMap(([id, necesario]): FaltanteStock[] => {
        const insumo = porId.get(id);
        if (!insumo || necesario <= 0) return [];
        const disponible = Number(insumo.stockDisponible);
        if (disponible >= necesario) return [];
        return [
          {
            insumoId: String(insumo.id),
            nombre: insumo.nombre,
            unidad: unidades[insumo.unidadMedida],
            disponible,
            necesario,
          },
        ];
      });
      if (faltantes.length) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          codigo: STOCK_INSUFICIENTE,
          message: `Stock insuficiente de ${faltantes.map((faltante) => faltante.nombre).join(', ')}`,
          faltantes,
        });
      }
    }

    for (const [id, cantidad] of cambios) {
      // Un insumo borrado después de armar la receta no tiene stock que mover.
      if (!porId.has(id)) continue;
      await repository.decrement({ id }, 'stockDisponible', cantidad);
    }
  }
}
