import { Injectable, NotFoundException } from '@nestjs/common';
import { InsumoRepository } from './insumo.repository';
import type { CrearInsumoDto } from './dto/crear-insumo.dto';
import { Insumo } from 'src/insumo/entities/insumo.entity';
import { unidades, type InsumoResponse } from './dto/insumo-response.dto';

@Injectable()
export class InsumoService {
  constructor(private readonly insumoRepository: InsumoRepository) {}

  async findAll(): Promise<InsumoResponse[]> {
    return (await this.insumoRepository.findAll()).map(this.insumoResponse);
  }

  async findById(id: number): Promise<InsumoResponse> {
    const insumo = await this.insumoRepository.findById(id);

    if (!insumo) {
      throw new NotFoundException(`No existe un insumo con id ${id}`);
    }

    return this.insumoResponse(insumo);
  }

  async update(id: number, datos: Partial<Insumo>): Promise<InsumoResponse> {
    const insumo = await this.insumoRepository.update(id, datos);

    if (!insumo) {
      throw new NotFoundException(`No existe un insumo con id ${id}`);
    }

    return this.insumoResponse(insumo);
  }

  async delete(id: number): Promise<{ message: string }> {
    const eliminado = await this.insumoRepository.delete(id);

    if (!eliminado) {
      throw new NotFoundException(`No existe un insumo con id ${id}`);
    }
    return { message: 'Insumo eliminado correctamente' };
  }

  async create(dto: CrearInsumoDto): Promise<InsumoResponse> {
    return this.insumoResponse(await this.insumoRepository.create(dto));
  }


  insumoResponse(insumo: Insumo): InsumoResponse {
  return {
    id: String(insumo.id),
    nombre: insumo.nombre,
    stock: Number(insumo.stockDisponible),
    unidad: unidades[insumo.unidadMedida],
  };
}

}
