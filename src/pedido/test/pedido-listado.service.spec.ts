import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { PedidoService } from '../pedido.service';
import { PedidoRepository } from '../pedido.repository';
import { PedidoProductoRepository } from '../pedido-producto.repository';
import { Pedido, EstadoPedido } from '../entities/pedido.entity';
import { PagoService } from '../../pago/pago.service';
import { MercadoPagoService } from '../../pago/mercado-pago.service';
import { ProductoService } from '../../producto/services/producto.service';
import { ProductoRepository } from '../../producto/repositories/producto.repository';
import { EmpleadoRepository } from '../../empleado/empleado.repository';
import { MesaRepository } from '../../mesa/mesa.repository';
import { StockService } from '../../insumo/stock.service';
import { ListarPedidosDto } from '../dto/listar-pedidos.dto';

describe('PedidoService.findPaginado', () => {
  let service: PedidoService;
  let module: TestingModule;
  const mockPedidoRepository = {
    findPaginado: jest.fn<
      ReturnType<PedidoRepository['findPaginado']>,
      Parameters<PedidoRepository['findPaginado']>
    >(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      providers: [
        PedidoService,
        { provide: PedidoRepository, useValue: mockPedidoRepository },
        ...[
          DataSource,
          PagoService,
          MesaRepository,
          PedidoProductoRepository,
          ProductoService,
          ProductoRepository,
          EmpleadoRepository,
          StockService,
          MercadoPagoService,
        ].map((provide) => ({ provide, useValue: {} })),
      ],
    }).compile();
    service = module.get(PedidoService);
  });

  afterEach(async () => module.close());

  it('pasa los filtros al repositorio y devuelve la página con el total', async () => {
    const pedido = Object.assign(new Pedido(), {
      id: 7,
      mesaId: 2,
      empleadoId: null,
      estado: EstadoPedido.ABIERTO,
      total: null,
      pedidosProductos: [],
    });
    mockPedidoRepository.findPaginado.mockResolvedValue([[pedido], 41]);
    const filtros = Object.assign(new ListarPedidosDto(), {
      mesaId: 2,
      estado: EstadoPedido.ABIERTO,
      pagina: 3,
      limite: 20,
    });

    const resultado = await service.findPaginado(filtros);

    expect(mockPedidoRepository.findPaginado).toHaveBeenCalledWith(filtros);
    expect(resultado).toEqual({
      data: [
        {
          id: '7',
          mesaId: '2',
          empleadoId: null,
          empleadoNombre: null,
          estado: EstadoPedido.ABIERTO,
          items: [],
          total: 0,
        },
      ],
      total: 41,
      pagina: 3,
      limite: 20,
    });
  });
});
