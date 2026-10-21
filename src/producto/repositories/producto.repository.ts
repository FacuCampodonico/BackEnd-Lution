import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, type EntityManager } from 'typeorm';
import { Producto } from '../entities/producto.entity';
import { CrearProductoDto } from '../dto/crear-producto.dto';
import { ActualizarProductoDto } from '../dto/actualizar-producto.dto';
import { CrearRecetaDto } from '../dto/crear-receta.dto';
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
      await this.validarInsumos(recetas, manager);

      const productos = manager.getRepository(Producto);
      const guardado = await productos.save(productos.create(datosProducto));

      await this.guardarRecetas(guardado.id, recetas, manager);

      return (await this.findOne(guardado.id, manager))!;
    });
  }

  private async validarInsumos(
    recetas: CrearRecetaDto[],
    manager: EntityManager,
  ): Promise<void> {
    if (!recetas.length) return;
    const ids = recetas.map((receta) => receta.insumoId);
    const insumos = await manager.getRepository(Insumo).findBy({ id: In(ids) });
    const existentes = new Set(insumos.map((insumo) => insumo.id));
    const faltantes = ids.filter((id) => !existentes.has(id));
    if (faltantes.length) {
      throw new BadRequestException(
        `No existen los insumos: ${faltantes.join(', ')}`,
      );
    }
  }

  private async guardarRecetas(
    productoId: number,
    recetas: CrearRecetaDto[],
    manager: EntityManager,
  ): Promise<void> {
    if (!recetas.length) return;
    await manager.getRepository(Receta).save(
      recetas.map((receta) => ({
        productoId,
        insumoId: receta.insumoId,
        cantidad: receta.cantidad,
      })),
    );
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
    const { recetas, ...datosProducto } = actualizarProductoDto;

    return this.repository.manager.transaction(async (manager) => {
      if (recetas) await this.validarInsumos(recetas, manager);

      // TypeORM rechaza un update sin columnas (p. ej. si solo cambia la receta).
      if (Object.values(datosProducto).some((valor) => valor !== undefined)) {
        await manager.getRepository(Producto).update(id, datosProducto);
      }

      if (recetas) {
        await manager.getRepository(Receta).delete({ productoId: id });
        await this.guardarRecetas(id, recetas, manager);
      }

      return this.findOne(id, manager);
    });
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
