import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PedidoService } from '../pedido.service';
import { PedidoRepository } from '../pedido.repository';
import { PedidoProductoRepository } from '../pedido-producto.repository';
import { Pedido, EstadoPedido } from '../entities/pedido.entity';
import { PedidoProducto } from '../entities/pedido-producto.entity';
import { PagoService } from '../../pago/pago.service';
import { Pago } from '../../pago/entities/pago.entity';
import { TipoPago } from '../../pago/enums/tipo-pago.enum';
import type { PagoRegistradoResponse } from '../../pago/dto/pago-registrado-response.dto';
import { ProductoService } from '../../producto/services/producto.service';
import { ProductoRepository } from '../../producto/repositories/producto.repository';
import { Producto } from '../../producto/entities/producto.entity';
import { EmpleadoRepository } from '../../empleado/empleado.repository';
import { MesaRepository } from '../../mesa/mesa.repository';
import { Mesa, EstadoMesa } from '../../mesa/entities/mesa.entity';
import { StockService } from '../../insumo/stock.service';

describe('PedidoService.registrarPago', () => {
  let service: PedidoService;
  let module: TestingModule;
  let pedido: Pedido;
  let manager: EntityManager;
  const mockPagoService = {
    create: jest.fn<
      ReturnType<PagoService['create']>,
      Parameters<PagoService['create']>
    >(),
  };
  const mockPedidoRepository = {
    findParaPago: jest.fn<
      ReturnType<PedidoRepository['findParaPago']>,
      Parameters<PedidoRepository['findParaPago']>
    >(),
    save: jest.fn<
      ReturnType<PedidoRepository['save']>,
      Parameters<PedidoRepository['save']>
    >(),
  };
  const mockMesaRepository = {
    actualizarEstado: jest.fn<
      ReturnType<MesaRepository['actualizarEstado']>,
      Parameters<MesaRepository['actualizarEstado']>
    >(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    manager = new EntityManager(new DataSource({ type: 'mysql' }));
    pedido = Object.assign(new Pedido(), {
      id: 1,
      estado: EstadoPedido.ABIERTO,
      total: 99999,
      fechaHoraCierre: null,
      pedidosProductos: [
        Object.assign(new PedidoProducto(), {
          cantidad: 2,
          producto: Object.assign(new Producto(), { precio: 8500 }),
        }),
        Object.assign(new PedidoProducto(), {
          cantidad: 3,
          producto: Object.assign(new Producto(), { precio: 1000 }),
        }),
      ],
      mesa: Object.assign(new Mesa(), { id: 2 }),
    });
    mockPedidoRepository.findParaPago.mockResolvedValue(pedido);
    mockPedidoRepository.save.mockResolvedValue(pedido);
    mockPagoService.create.mockResolvedValue(new Pago());
    mockMesaRepository.actualizarEstado.mockResolvedValue(undefined);

    module = await Test.createTestingModule({
      providers: [
        PedidoService,
        { provide: PagoService, useValue: mockPagoService },
        { provide: PedidoRepository, useValue: mockPedidoRepository },
        { provide: MesaRepository, useValue: mockMesaRepository },
        {
          provide: DataSource,
          useValue: {
            transaction: (
              work: (value: EntityManager) => Promise<PagoRegistradoResponse>,
            ) => work(manager),
          },
        },
        ...[
          PedidoProductoRepository,
          ProductoService,
          ProductoRepository,
          EmpleadoRepository,
          StockService,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    }).compile();
    service = module.get(PedidoService);
  });

  afterEach(async () => module.close());

  it('recalcula el total de los productos, delega el pago, cierra el pedido y libera la mesa usando el mismo manager', async () => {
    const resultado = await service.registrarPago(1, {
      tipo: TipoPago.EFECTIVO,
      pagaCon: 25000,
    });

    expect(resultado).toEqual({
      message: 'Pago registrado con éxito',
      pedidoId: '1',
      total: 20000,
      vuelto: 5000,
    });
    expect(mockPedidoRepository.findParaPago).toHaveBeenCalledTimes(1);
    expect(mockPedidoRepository.findParaPago).toHaveBeenCalledWith(1, manager);
    expect(mockPagoService.create).toHaveBeenCalledTimes(1);
    expect(mockPagoService.create).toHaveBeenCalledWith(
      {
        tipo: TipoPago.EFECTIVO,
        pagaCon: 25000,
        vuelto: 5000,
        titular: undefined,
        marca: undefined,
        cuotas: undefined,
        pedido: { id: 1 },
      },
      manager,
    );
    expect(pedido.estado).toBe(EstadoPedido.PAGADO);
    expect(pedido.total).toBe(20000);
    expect(pedido.fechaHoraCierre).toBeInstanceOf(Date);
    expect(mockPedidoRepository.save).toHaveBeenCalledWith(pedido, manager);
    expect(mockMesaRepository.actualizarEstado).toHaveBeenCalledWith(
      2,
      EstadoMesa.LIBRE,
      manager,
    );
  });

  it('acepta efectivo exacto y devuelve vuelto cero', async () => {
    const resultado = await service.registrarPago(1, {
      tipo: TipoPago.EFECTIVO,
      pagaCon: 20000,
    });

    expect(resultado.vuelto).toBe(0);
    expect(mockPagoService.create).toHaveBeenCalledWith(
      expect.objectContaining({ vuelto: 0 }),
      manager,
    );
  });

  it('conserva los datos de tarjeta sin exigir efectivo ni guardar vuelto', async () => {
    const resultado = await service.registrarPago(1, {
      tipo: TipoPago.TARJETA,
      titular: 'Ana',
      marca: 'Visa',
      cuotas: 3,
    });

    expect(resultado).toEqual({
      message: 'Pago registrado con éxito',
      pedidoId: '1',
      total: 20000,
      vuelto: 0,
    });
    expect(mockPagoService.create).toHaveBeenCalledWith(
      {
        tipo: TipoPago.TARJETA,
        pagaCon: undefined,
        vuelto: undefined,
        titular: 'Ana',
        marca: 'Visa',
        cuotas: 3,
        pedido: { id: 1 },
      },
      manager,
    );
  });

  it('rechaza efectivo insuficiente antes de crear el pago o cerrar el pedido', async () => {
    await expect(
      service.registrarPago(1, { tipo: TipoPago.EFECTIVO, pagaCon: 10000 }),
    ).rejects.toThrow(BadRequestException);

    expect(mockPagoService.create).not.toHaveBeenCalled();
    expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    expect(mockMesaRepository.actualizarEstado).not.toHaveBeenCalled();
    expect(pedido.estado).toBe(EstadoPedido.ABIERTO);
  });

  it('rechaza un pedido inexistente antes de crear el pago', async () => {
    mockPedidoRepository.findParaPago.mockResolvedValue(null);

    await expect(
      service.registrarPago(1, { tipo: TipoPago.TARJETA }),
    ).rejects.toThrow(NotFoundException);

    expect(mockPagoService.create).not.toHaveBeenCalled();
    expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    expect(mockMesaRepository.actualizarEstado).not.toHaveBeenCalled();
  });

  it('rechaza un pedido pagado sin generar otro pago', async () => {
    pedido.estado = EstadoPedido.PAGADO;

    await expect(
      service.registrarPago(1, { tipo: TipoPago.TARJETA }),
    ).rejects.toThrow(ConflictException);

    expect(mockPagoService.create).not.toHaveBeenCalled();
    expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    expect(mockMesaRepository.actualizarEstado).not.toHaveBeenCalled();
  });

  it('no cierra el pedido ni actualiza la mesa si falla PagoService.create', async () => {
    const error = new Error('Falló la creación del pago');
    mockPagoService.create.mockRejectedValue(error);

    await expect(
      service.registrarPago(1, { tipo: TipoPago.TARJETA }),
    ).rejects.toBe(error);

    expect(mockPedidoRepository.save).not.toHaveBeenCalled();
    expect(mockMesaRepository.actualizarEstado).not.toHaveBeenCalled();
    expect(pedido.estado).toBe(EstadoPedido.ABIERTO);
    expect(pedido.fechaHoraCierre).toBeNull();
  });
});
