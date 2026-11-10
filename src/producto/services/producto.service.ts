import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductoRepository } from '../repositories/producto.repository';
import { CrearProductoDto } from '../dto/crear-producto.dto';
import { ActualizarProductoDto } from '../dto/actualizar-producto.dto';
import {
  productoResponse,
  type ProductoResponse,
} from '../dto/producto-response.dto';

@Injectable()
export class ProductoService {
  constructor(private readonly productoRepository: ProductoRepository) {}

  async create(crearProductoDto: CrearProductoDto): Promise<ProductoResponse> {
    return productoResponse(
      await this.productoRepository.create(crearProductoDto),
    );
  }

  async findAll(): Promise<ProductoResponse[]> {
    return (await this.productoRepository.findAll()).map(productoResponse);
  }

  async findOne(id: number): Promise<ProductoResponse> {
    const producto = await this.productoRepository.findOne(id);
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return productoResponse(producto);
  }

  async update(
    id: number,
    actualizarProductoDto: ActualizarProductoDto,
  ): Promise<ProductoResponse | null> {
    await this.findOne(id);
    const actualizado = await this.productoRepository.update(
      id,
      actualizarProductoDto,
    );
    return actualizado ? productoResponse(actualizado) : null;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.productoRepository.remove(id);
  }
}
