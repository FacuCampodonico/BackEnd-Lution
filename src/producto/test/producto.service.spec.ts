import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from '../services/producto.service';
import { ProductoRepository } from '../repositories/producto.repository';
import { CategoriaRepository } from '../../categoria/categoria.repository';
import { CrearProductoDto } from '../dto/crear-producto.dto';

describe('ProductoService', () => {
  let service: ProductoService;

  const mockProductoRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((producto) =>
      Promise.resolve({ id: 2, ...producto }),
    ),
  };

  const mockCategoriaRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: ProductoRepository,
          useValue: mockProductoRepository,
        },
        {
          provide: CategoriaRepository,
          useValue: mockCategoriaRepository,
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
  });

  it('debe crear y guardar un producto correctamente', async () => {
    const categoriaMock = { id: 1, nombre: 'Comidas' };
    mockCategoriaRepository.findOneBy.mockResolvedValue(categoriaMock);

    const crearProductoDto = {
      nombre: 'Hamburguesa Completa',
      descripcion: 'Con queso, lechuga y tomate',
      precio: 8500,
      idCategoria: 1,
    };

    const productoGuardadoMock = { id: 2, ...crearProductoDto };

    mockProductoRepository.create.mockReturnValue(productoGuardadoMock);
    mockProductoRepository.save.mockResolvedValue(productoGuardadoMock);

    const productoCreado = await service.create(crearProductoDto as any);

    expect(productoCreado).toHaveProperty('id', '2');
    expect(productoCreado.nombre).toBe('Hamburguesa Completa');
    expect(mockProductoRepository.create).toHaveBeenCalled();;
  });
});