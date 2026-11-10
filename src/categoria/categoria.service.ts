import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaRepository } from './categoria.repository';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';
import {
  type CategoriaResponse
} from './dto/categoria-response.dto';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriaService {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  async create(
    crearCategoriaDto: CrearCategoriaDto,
  ): Promise<CategoriaResponse> {
    return this.categoriaResponse(
      await this.categoriaRepository.create(crearCategoriaDto),
    );
  }

  async findAll(): Promise<CategoriaResponse[]> {
    return (await this.categoriaRepository.findAll()).map(this.categoriaResponse);
  }

  async findOne(id: number): Promise<CategoriaResponse> {
    const categoria = await this.categoriaRepository.findOne(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return this.categoriaResponse(categoria);
  }

  async update(
    id: number,
    actualizarCategoriaDto: ActualizarCategoriaDto,
  ): Promise<CategoriaResponse | null> {
    await this.findOne(id);
    const actualizado = await this.categoriaRepository.update(
      id,
      actualizarCategoriaDto,
    );
    return actualizado ? this.categoriaResponse(actualizado) : null;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.categoriaRepository.remove(id);
  }

  categoriaResponse(categoria: Categoria): CategoriaResponse {
  return {
    id: String(categoria.id),
    nombre: categoria.nombre,
    productoIds: (categoria.productos ?? []).map((producto) =>
      String(producto.id),
    ),
  };
}
}
