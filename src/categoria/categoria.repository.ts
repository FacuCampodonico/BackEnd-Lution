import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';

@Injectable()
export class CategoriaRepository {
  constructor(
    @InjectRepository(Categoria)
    private readonly repository: Repository<Categoria>,
  ) {}

  async create(crearCategoriaDto: CrearCategoriaDto): Promise<Categoria> {
    const nuevaCategoria = this.repository.create(crearCategoriaDto);
    return await this.repository.save(nuevaCategoria);
  }

  async findAll(): Promise<Categoria[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<Categoria | null> {
    return await this.repository.findOneBy({ id });
  }

  async update(id: number, actualizarCategoriaDto: ActualizarCategoriaDto): Promise<Categoria | null> {
    await this.repository.update(id, actualizarCategoriaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}