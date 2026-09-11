import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InsumoRepository } from './insumo.repository';
import type { CrearInsumoDto } from './dto/crear-insumo.dto';
import { Insumo } from 'src/insumo/entities/insumo.entity';


@Injectable()
export class InsumoService {
  constructor(private readonly insumoRepository: InsumoRepository) {}

  async findAll(): Promise<Insumo[]> {
    return this.insumoRepository.findAll();
  }

  async findById(id: number): Promise<Insumo> {
    const insumo = await this.insumoRepository.findById(id);

    if (!insumo) {
      throw new NotFoundException(
        `No existe un insumo con id ${id}`,
      );
    }

    return insumo;
  }

  async update(
    id: number,
    datos: Partial<Insumo>,
  ): Promise<Insumo> {
    const insumo = await this.insumoRepository.update(
      id,
      datos,
    );

    if (!insumo) {
      throw new NotFoundException(
        `No existe un insumo con id ${id}`,
      );
    }

    return insumo;
  }

  async delete(id: number): Promise<void> {
    const eliminado = await this.insumoRepository.delete(id);

    if (!eliminado) {
      throw new NotFoundException(
        `No existe un insumo con id ${id}`,
      );
    }
  }

  async create(dto: CrearInsumoDto): Promise<Insumo> {
    return this.insumoRepository.create(dto);
  }
}
