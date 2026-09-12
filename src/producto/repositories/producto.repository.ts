import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class ProductoRepository {
  constructor(
    @InjectRepository(Producto)
    private readonly repository: Repository<Producto>,
  ) {}

  async create(crearProductoDto: CrearProductoDto): Promise<Producto> {
    const nuevoProducto = this.repository.create(crearProductoDto);
    return await this.repository.save(nuevoProducto);
  }

  async findAll(): Promise<Producto[]> {
    return await this.repository.find({
      relations: { categoria: true },
    });
  }

  async findOne(id: number): Promise<Producto | null> {
    return await this.repository.findOne({
      where: { id },
      relations: { categoria: true },
    });
  }

  async update(id: number, actualizarProductoDto: ActualizarProductoDto): Promise<Producto | null> {
    await this.repository.update(id, actualizarProductoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}