import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MesaController } from '../mesa.controller';
import { MesaService } from '../mesa.service';
import { MesaRepository } from '../mesa.repository';
import { PedidoService } from '../../pedido/pedido.service';

describe('MesaController (E2E)', () => {
  let app: INestApplication;

  const mockMesaRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPedidoRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  const mockPedidoService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MesaController],
      providers: [
        MesaService,
        {
          provide: PedidoService,
          useValue: mockPedidoService,
        },
        {
          provide: MesaRepository,
          useValue: mockMesaRepository,
        },
        {
          provide: 'PedidoRepository',
          useValue: mockPedidoRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /mesa', () => {
    it('debe retornar un status 200 y la lista de mesas formateada', async () => {
      const mockMesas = [
        { id: 1, numero: 1, capacidad: 4, estado: 'libre' },
        { id: 9, numero: 99, capacidad: 4, estado: 'abierta' },
      ];

      mockMesaRepository.findAll.mockResolvedValue(mockMesas);

      const response = await request(app.getHttpServer())
        .get('/mesas')
        .expect(200);

      console.log('RESPUESTA API:', JSON.stringify(response.body, null, 2));

      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe('1');
      expect(response.body[0].numero).toBe('1');
      expect(response.body[0].estado).toBe('libre');
    });
  });
});