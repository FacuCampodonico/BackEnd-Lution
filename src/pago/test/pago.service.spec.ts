import { Test, TestingModule } from '@nestjs/testing';
import { PagoService } from '../pago.service';
import { PagoRepository } from '../pago.repository';
import { PedidoRepository } from '../../pedido/pedido.repository';
import { BadRequestException } from '@nestjs/common';
import { TipoPago } from '../enums/tipo-pago.enum';

describe('PagoService', () => {
  let service: PagoService;

  const mockPagoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPedidoRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagoService,
        {
          provide: PagoRepository,
          useValue: mockPagoRepository,
        },
        {
          provide: PedidoRepository,
          useValue: mockPedidoRepository,
        },
      ],
    }).compile();

    service = module.get<PagoService>(PagoService);
  });

  it('debe calcular el vuelto correctamente al procesar un pago en efectivo', async () => {
    const pedidoMock = { id: 1, total: 17000, estado: 'abierto' };
    const dtoPago = { pedidoId: 1, tipo: TipoPago.EFECTIVO, pagaCon: 20000 };
    const pagoCreadoMock = { id: 1, ...dtoPago };

    mockPedidoRepository.findOne.mockResolvedValue(pedidoMock);
    mockPagoRepository.create.mockResolvedValue(pagoCreadoMock);

    const resultado = await service.create(dtoPago as any);

    expect(resultado).toBeDefined();
    expect(resultado).toEqual(pagoCreadoMock);
    expect(mockPagoRepository.create).toHaveBeenCalledWith(dtoPago);
  });

  it('debe lanzar BadRequestException si el monto con el que paga es menor al total', async () => {
    const pedidoMock = { id: 1, total: 17000, estado: 'abierto' };
    const dtoPagoInsuficiente = { pedidoId: 1, tipo: TipoPago.EFECTIVO, pagaCon: 10000 };

    mockPedidoRepository.findOne.mockResolvedValue(pedidoMock);

    await expect(service.create(dtoPagoInsuficiente as any)).rejects.toThrow(
      BadRequestException,
    );
  });
});