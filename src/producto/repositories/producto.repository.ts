import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { CrearProductoDto } from '../dto/crear-producto.dto';
import { ActualizarProductoDto } from '../dto/actualizar-producto.dto';
import { Insumo } from '../../insumo/entities/insumo.entity';
import { Receta } from '../entities/receta.entity';

@Injectable()
export class ProductoRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
  ) {}

  async create(crearProductoDto: CrearProductoDto): Promise<Producto> {
    const { recetas = [], ...datosProducto } = crearProductoDto;

    return this.repository.manager.transaction(async (manager) => {
      if (recetas.length) {
        const ids = recetas.map((receta) => receta.insumoId);
        const insumos = await manager
          .getRepository(Insumo)
          .findBy({ id: In(ids) });
        const existentes = new Set(insumos.map((insumo) => insumo.id));
        const faltantes = ids.filter((id) => !existentes.has(id));
        if (faltantes.length) {
          throw new BadRequestException(
            `No existen los insumos: ${faltantes.join(', ')}`,
          );
        }
      }

      const productos = manager.getRepository(Producto);
      const guardado = await productos.save(productos.create(datosProducto));

      if (recetas.length) {
        await manager.getRepository(Receta).save(
          recetas.map((receta) => ({
            productoId: guardado.id,
            insumoId: receta.insumoId,
            cantidad: receta.cantidad,
          })),
        );
      }

      return (await this.findOne(guardado.id, manager))!;
    });
  }

  async findAll(): Promise<Producto[]> {
    return await this.repository.find({
      relations: { categoria: true, recetas: true },
    });
  }

  async findOne(id: number, manager?: EntityManager): Promise<Producto | null> {
    const repository = manager
      ? manager.getRepository(Producto)
      : this.repository;
    return await repository.findOne({
      where: { id },
      relations: { categoria: true, recetas: true },
    });
  }

  async update(
    id: number,
    actualizarProductoDto: ActualizarProductoDto,
  ): Promise<Producto | null> {
    await this.repository.update(id, actualizarProductoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
