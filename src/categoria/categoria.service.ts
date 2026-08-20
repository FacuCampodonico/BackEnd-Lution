import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaRepository } from './categoria.repository';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  create(crearCategoriaDto: CrearCategoriaDto) {
    return this.categoriaRepository.create(crearCategoriaDto);
  }

  findAll() {
    return this.categoriaRepository.findAll();
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepository.findOne(id);
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async update(id: number, actualizarCategoriaDto: ActualizarCategoriaDto) {
    await this.findOne(id);
    return this.categoriaRepository.update(id, actualizarCategoriaDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.categoriaRepository.remove(id);
  }
}