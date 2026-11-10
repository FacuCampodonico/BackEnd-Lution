import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { MesaService } from '../mesa.service';
import { MesaRepository } from '../mesa.repository';
import { Pedido } from '../../pedido/entities/pedido.entity';

describe('MesaService', () => {
  let service: MesaService;

  const mockMesaRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPedidoRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MesaService,
        {
          provide: MesaRepository,
          useValue: mockMesaRepository,
        },
        {
          provide: getRepositoryToken(Pedido),
          useValue: mockPedidoRepository,
        },
      ],
    }).compile();

    service = module.get<MesaService>(MesaService);
  });

  it('debe retornar todas las mesas registradas', async () => {
    const entidadesMock = [
      { id: 1, numero: 1, capacidad: 4, estado: 'libre' },
      { id: 9, numero: 99, capacidad: 4, estado: 'abierta' },
    ];

    mockMesaRepository.findAll.mockResolvedValue(entidadesMock);

    const resultado = await service.findAll();

    expect(resultado).toHaveLength(2);

    expect(resultado[0]?.id).toBe('1');
    expect(resultado[0]?.numero).toBe('1');
    expect(resultado[0]?.estado).toBe('libre');

    expect(resultado[1]?.id).toBe('9');
    expect(resultado[1]?.numero).toBe('99');
    expect(resultado[1]?.estado).toBe('abierta');

    expect(mockMesaRepository.findAll).toHaveBeenCalledTimes(1);
  });
});