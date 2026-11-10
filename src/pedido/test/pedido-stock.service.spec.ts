import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, EntityManager } from 'typeorm';
import { PedidoService } from '../pedido.service';
import { PedidoRepository } from '../pedido.repository';
import { PedidoProductoRepository } from '../pedido-producto.repository';
import { Pedido, EstadoPedido } from '../entities/pedido.entity';
import { PedidoProducto } from '../entities/pedido-producto.entity';
import { PagoService } from '../../pago/pago.service';
import { MercadoPagoService } from '../../pago/mercado-pago.service';
import { ProductoService } from '../../producto/services/producto.service';
import { ProductoRepository } from '../../producto/repositories/producto.repository';
import { Producto } from '../../producto/entities/producto.entity';
import { Receta } from '../../producto/entities/receta.entity';
import { EmpleadoRepository } from '../../empleado/empleado.repository';
import { MesaRepository } from '../../mesa/mesa.repository';
import { Mesa } from '../../mesa/entities/mesa.entity';
import { StockService } from '../../insumo/stock.service';

// Empanada: 50 g de queso (insumo 1) por unidad.
const empanada = Object.assign(new Producto(), {
  id: 7,
  nombre: 'Empanada',
  precio: 1000,
  recetas: [Object.assign(new Receta(), { insumoId: 1, cantidad: 50 })],
});

describe('PedidoService: control de stock', () => {
  let service: PedidoService;
  let module: TestingModule;
  let manager: EntityManager;
  let pedido: Pedido;
  let item: PedidoProducto;

  const stockService = { ajustar: jest.fn() };
  const pedidoRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    findPedidoAbiertoByMesa: jest.fn(),
    remove: jest.fn(),
  };
  const pedidoProductoRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const productoRepository = { findOne: jest.fn() };
  const productoService = { findOne: jest.fn() };
  const mesaRepository = { findOne: jest.fn(), actualizarEstado: jest.fn() };
  const empleadoRepository = { findById: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    manager = new EntityManager(new DataSource({ type: 'mysql' }));
    item = Object.assign(new PedidoProducto(), {
      id: 3,
      pedidoId: 1,
      productoId: empanada.id,
      cantidad: 2,
      producto: empanada,
    });
    pedido = Object.assign(new Pedido(), {
      id: 1,
      mesaId: 4,
      empleadoId: null,
      estado: EstadoPedido.ABIERTO,
      fechaHoraCierre: null,
      pedidosProductos: [item],
    });
    pedidoRepository.findOne.mockResolvedValue(pedido);
    pedidoRepository.create.mockResolvedValue(pedido);
    pedidoRepository.findPedidoAbiertoByMesa
      .mockResolvedValueOnce(null)
      .mockResolvedValue(pedido);
    pedidoProductoRepository.findOne.mockResolvedValue(item);
    productoRepository.findOne.mockResolvedValue(empanada);
    mesaRepository.findOne.mockResolvedValue(new Mesa());
    empleadoRepository.findById.mockResolvedValue({ id: 5 });

    module = await Test.createTestingModule({
      providers: [
        PedidoService,
        { provide: StockService, useValue: stockService },
        { provide: PedidoRepository, useValue: pedidoRepository },
        {
          provide: PedidoProductoRepository,
          useValue: pedidoProductoRepository,
        },
        { provide: ProductoRepository, useValue: productoRepository },
        { provide: ProductoService, useValue: productoService },
        { provide: MesaRepository, useValue: mesaRepository },
        { provide: EmpleadoRepository, useValue: empleadoRepository },
        { provide: PagoService, useValue: {} },
        { provide: MercadoPagoService, useValue: {} },
        {
          provide: DataSource,
          useValue: {
            transaction: (work: (value: EntityManager) => Promise<unknown>) =>
              work(manager),
          },
        },
      ],
    }).compile();
    service = module.get(PedidoService);
  });

  afterEach(async () => module.close());

  it('al crear el pedido descuenta la receta por la cantidad pedida', async () => {
    await service.crearPedidoPorMesa(
      4,
      { empleadoId: 5, items: [{ productoId: empanada.id, cantidad: 2 }] },
      true,
    );

    expect(stockService.ajustar).toHaveBeenCalledWith(
      new Map([[1, 100]]),
      manager,
      true,
    );
  });

  it('al agregar un ítem descuenta su receta', async () => {
    await service.agregarProducto(1, { productoId: empanada.id, cantidad: 3 });

    expect(pedidoProductoRepository.create).toHaveBeenCalledWith(
      1,
      { productoId: empanada.id, cantidad: 3 },
      manager,
    );
    expect(stockService.ajustar).toHaveBeenCalledWith(
      new Map([[1, 150]]),
      manager,
      false,
    );
  });

  it('al subir la cantidad descuenta solo la diferencia', async () => {
    await service.actualizarProducto(1, 3, { cantidad: 5 });

    expect(stockService.ajustar).toHaveBeenCalledWith(
      new Map([[1, 150]]),
      manager,
      false,
    );
  });

  it('al bajar la cantidad devuelve la diferencia', async () => {
    await service.actualizarProducto(1, 3, { cantidad: 1 });

    expect(stockService.ajustar).toHaveBeenCalledWith(
      new Map([[1, -50]]),
      manager,
      false,
    );
  });

  it('si la cantidad no cambia no mueve stock', async () => {
    await service.actualizarProducto(1, 3, { comentario: 'sin cebolla' });

    expect(stockService.ajustar).not.toHaveBeenCalled();
  });

  it('al quitar un ítem devuelve su receta', async () => {
    await service.eliminarProducto(1, 3);

    expect(pedidoProductoRepository.remove).toHaveBeenCalledWith(1, 3, manager);
    expect(stockService.ajustar).toHaveBeenCalledWith(
      new Map([[1, -100]]),
      manager,
    );
  });

  it('al cancelar el pedido devuelve el stock de todos sus ítems', async () => {
    await service.delete(1);

    expect(stockService.ajustar).toHaveBeenCalledWith(
      new Map([[1, -100]]),
      manager,
    );
    expect(pedidoRepository.remove).toHaveBeenCalledWith(1, manager);
  });
});
