import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoRepository } from './producto.repository';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private readonly productoRepository: ProductoRepository) {}

  create(crearProductoDto: CrearProductoDto) {
    return this.productoRepository.create(crearProductoDto);
  }

  findAll() {
    return this.productoRepository.findAll();
  }

  async findOne(id: number) {
    const producto = await this.productoRepository.findOne(id);
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async update(id: number, actualizarProductoDto: ActualizarProductoDto) {
    await this.findOne(id);
    return this.productoRepository.update(id, actualizarProductoDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.productoRepository.remove(id);
  }
}