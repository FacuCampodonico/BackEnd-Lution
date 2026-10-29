import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { PedidoService } from '../pedido.service';
import { PedidoRepository } from '../pedido.repository';
import { PedidoProductoRepository } from '../pedido-producto.repository';
import { Pedido, EstadoPedido } from '../entities/pedido.entity';
import { PedidoProducto } from '../entities/pedido-producto.entity';
import { PagoService } from '../../pago/pago.service';
import { Pago } from '../../pago/entities/pago.entity';
import { TipoPago } from '../../pago/enums/tipo-pago.enum';
import {
  MercadoPagoService,
  type PagoMercadoPago,
} from '../../pago/mercado-pago.service';
import { ProductoService } from '../../producto/services/producto.service';
import { ProductoRepository } from '../../producto/repositories/producto.repository';
import { Producto } from '../../producto/entities/producto.entity';
import { EmpleadoRepository } from '../../empleado/empleado.repository';
import { MesaRepository } from '../../mesa/mesa.repository';
import { Mesa, EstadoMesa } from '../../mesa/entities/mesa.entity';
import { StockService } from '../../insumo/stock.service';

describe('PedidoService: Mercado Pago', () => {
  let service: PedidoService;
  let module: TestingModule;
  let pedido: Pedido;
  let pagoMp: PagoMercadoPago;
  let manager: EntityManager;

  const pagoService = { create: jest.fn() };
  const pedidoRepository = {
    findOne: jest.fn(),
    findParaPago: jest.fn(),
    save: jest.fn(),
  };
  const mesaRepository = { actualizarEstado: jest.fn() };
  const mercadoPagoService = {
    crearPreferencia: jest.fn(),
    obtenerPago: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    manager = new EntityManager(new DataSource({ type: 'mysql' }));
    pedido = Object.assign(new Pedido(), {
      id: 1,
      mesaId: 2,
      estado: EstadoPedido.ABIERTO,
      fechaHoraCierre: null,
      pedidosProductos: [
        Object.assign(new PedidoProducto(), {
          productoId: 7,
          cantidad: 2,
          producto: Object.assign(new Producto(), {
            nombre: 'Milanesa',
            precio: 8500,
          }),
        }),
        Object.assign(new PedidoProducto(), {
          productoId: 9,
          cantidad: 3,
          producto: Object.assign(new Producto(), {
            nombre: 'Agua',
            precio: 1000,
          }),
        }),
      ],
      mesa: Object.assign(new Mesa(), { id: 2 }),
    });
    pagoMp = {
      id: 555,
      status: 'approved',
      external_reference: '1',
      transaction_amount: 20000,
    };
    pedidoRepository.findOne.mockResolvedValue(pedido);
    pedidoRepository.findParaPago.mockResolvedValue(pedido);
    pedidoRepository.save.mockResolvedValue(pedido);
    pagoService.create.mockResolvedValue(new Pago());
    mesaRepository.actualizarEstado.mockResolvedValue(undefined);
    mercadoPagoService.obtenerPago.mockImplementation(() =>
      Promise.resolve(pagoMp),
    );
    mercadoPagoService.crearPreferencia.mockResolvedValue({
      id: 'pref-1',
      checkoutUrl: 'https://sandbox.mercadopago.com.ar/checkout/pref-1',
    });

    module = await Test.createTestingModule({
      providers: [
        PedidoService,
        { provide: PagoService, useValue: pagoService },
        { provide: PedidoRepository, useValue: pedidoRepository },
        { provide: MesaRepository, useValue: mesaRepository },
        { provide: MercadoPagoService, useValue: mercadoPagoService },
        {
          provide: DataSource,
          useValue: {
            transaction: (work: (value: EntityManager) => Promise<unknown>) =>
              work(manager),
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

  describe('crearPreferenciaMercadoPago', () => {
    it('arma la preferencia con los productos del pedido y vuelve a la pantalla de pago de la mesa', async () => {
      const resultado = await service.crearPreferenciaMercadoPago(1);

      expect(resultado).toEqual({
        preferenceId: 'pref-1',
        checkoutUrl: 'https://sandbox.mercadopago.com.ar/checkout/pref-1',
      });
      expect(mercadoPagoService.crearPreferencia).toHaveBeenCalledWith({
        items: [
          { id: '7', title: 'Milanesa', quantity: 2, unit_price: 8500 },
          { id: '9', title: 'Agua', quantity: 3, unit_price: 1000 },
        ],
        externalReference: '1',
        rutaRetorno: '/mesas/2/pago',
      });
    });

    it('rechaza un pedido ya pagado', async () => {
      pedido.estado = EstadoPedido.PAGADO;

      await expect(service.crearPreferenciaMercadoPago(1)).rejects.toThrow(
        ConflictException,
      );
      expect(mercadoPagoService.crearPreferencia).not.toHaveBeenCalled();
    });

    it('rechaza un pedido sin productos', async () => {
      pedido.pedidosProductos = [];

      await expect(service.crearPreferenciaMercadoPago(1)).rejects.toThrow(
        BadRequestException,
      );
      expect(mercadoPagoService.crearPreferencia).not.toHaveBeenCalled();
    });
  });

  describe('confirmarPagoMercadoPago', () => {
    it('registra el pago aprobado, cierra el pedido y libera la mesa', async () => {
      const resultado = await service.confirmarPagoMercadoPago(1, '555');

      expect(resultado).toEqual({
        message: 'Pago con Mercado Pago registrado con éxito',
        pedidoId: '1',
        total: 20000,
        vuelto: 0,
      });
      expect(mercadoPagoService.obtenerPago).toHaveBeenCalledWith('555');
      expect(pagoService.create).toHaveBeenCalledWith(
        {
          tipo: TipoPago.MERCADO_PAGO,
          mpPaymentId: '555',
          pedido: { id: 1 },
        },
        manager,
      );
      expect(pedido.estado).toBe(EstadoPedido.PAGADO);
      expect(pedido.total).toBe(20000);
      expect(pedido.fechaHoraCierre).toBeInstanceOf(Date);
      expect(mesaRepository.actualizarEstado).toHaveBeenCalledWith(
        2,
        EstadoMesa.LIBRE,
        manager,
      );
    });

    it('rechaza un pago de otro pedido', async () => {
      pagoMp.external_reference = '99';

      await expect(service.confirmarPagoMercadoPago(1, '555')).rejects.toThrow(
        'El pago de Mercado Pago no corresponde a este pedido',
      );
      expect(pagoService.create).not.toHaveBeenCalled();
    });

    it('rechaza un pago pendiente sin cerrar el pedido', async () => {
      pagoMp.status = 'in_process';

      await expect(service.confirmarPagoMercadoPago(1, '555')).rejects.toThrow(
        'El pago de Mercado Pago todavía está pendiente de acreditación',
      );
      expect(pagoService.create).not.toHaveBeenCalled();
      expect(pedido.estado).toBe(EstadoPedido.ABIERTO);
    });

    it('rechaza un pago rechazado', async () => {
      pagoMp.status = 'rejected';

      await expect(service.confirmarPagoMercadoPago(1, '555')).rejects.toThrow(
        'El pago de Mercado Pago no fue aprobado (estado: rejected)',
      );
      expect(pagoService.create).not.toHaveBeenCalled();
    });

    it('rechaza un monto que no coincide con el total actual del pedido', async () => {
      pagoMp.transaction_amount = 17000;

      await expect(service.confirmarPagoMercadoPago(1, '555')).rejects.toThrow(
        BadRequestException,
      );
      expect(pagoService.create).not.toHaveBeenCalled();
      expect(mesaRepository.actualizarEstado).not.toHaveBeenCalled();
    });

    it('confirmar dos veces el mismo pago devuelve el mismo resultado sin registrar otro', async () => {
      pedido.estado = EstadoPedido.PAGADO;
      pedido.total = 20000;
      pedido.pago = Object.assign(new Pago(), { mpPaymentId: '555' });

      const resultado = await service.confirmarPagoMercadoPago(1, '555');

      expect(resultado.total).toBe(20000);
      expect(pagoService.create).not.toHaveBeenCalled();
    });

    it('rechaza confirmar un pedido que se pagó por otro medio', async () => {
      pedido.estado = EstadoPedido.PAGADO;
      pedido.pago = Object.assign(new Pago(), { tipo: TipoPago.EFECTIVO });

      await expect(service.confirmarPagoMercadoPago(1, '555')).rejects.toThrow(
        ConflictException,
      );
      expect(pagoService.create).not.toHaveBeenCalled();
    });
  });
});
