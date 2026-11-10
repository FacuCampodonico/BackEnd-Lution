import { DataSource, EntityManager, Repository } from 'typeorm';
import { PagoService } from '../pago.service';
import { PagoRepository } from '../pago.repository';
import { Pago } from '../entities/pago.entity';
import { TipoPago } from '../enums/tipo-pago.enum';
import { Pedido } from '../../pedido/entities/pedido.entity';

describe('PagoService.create con PagoRepository', () => {
  let service: PagoService;
  let repository: Repository<Pago>;
  let manager: EntityManager;
  let transactionRepository: Repository<Pago>;
  let pago: Pago;
  const datos = {
    tipo: TipoPago.EFECTIVO,
    pagaCon: 20000,
    vuelto: 3000,
    pedido: { id: 1 },
  };

  beforeEach(() => {
    // No se inicializa la conexión: create/save se simulan en cada caso.
    const dataSource = new DataSource({ type: 'mysql' });
    repository = dataSource.getRepository(Pago);
    manager = dataSource.createEntityManager();
    transactionRepository = manager.getRepository(Pago);
    pago = Object.assign(new Pago(), {
      ...datos,
      id: 4,
      pedido: Object.assign(new Pedido(), { id: 1 }),
    });
    service = new PagoService(new PagoRepository(repository));
  });

  afterEach(() => jest.restoreAllMocks());

  it('usa el repositorio habitual cuando no se recibe un manager y devuelve el pago guardado', async () => {
    const create = jest.spyOn(repository, 'create').mockReturnValue(pago);
    const save = jest.spyOn(repository, 'save').mockResolvedValue(pago);
    const transactionSave = jest.spyOn(transactionRepository, 'save');

    await expect(service.create(datos)).resolves.toBe(pago);

    expect(create).toHaveBeenCalledWith(datos);
    expect(save).toHaveBeenCalledWith(pago);
    expect(transactionSave).not.toHaveBeenCalled();
  });

  it('guarda con el manager recibido sin utilizar el repositorio habitual', async () => {
    const create = jest
      .spyOn(transactionRepository, 'create')
      .mockReturnValue(pago);
    const save = jest
      .spyOn(transactionRepository, 'save')
      .mockResolvedValue(pago);
    const defaultCreate = jest.spyOn(repository, 'create');
    const defaultSave = jest.spyOn(repository, 'save');

    await expect(service.create(datos, manager)).resolves.toBe(pago);

    expect(create).toHaveBeenCalledWith(datos);
    expect(save).toHaveBeenCalledWith(pago);
    expect(defaultCreate).not.toHaveBeenCalled();
    expect(defaultSave).not.toHaveBeenCalled();
  });

  it('propaga el error al fallar el guardado con el manager recibido', async () => {
    const error = new Error('No se pudo guardar el pago');
    jest.spyOn(transactionRepository, 'create').mockReturnValue(pago);
    jest.spyOn(transactionRepository, 'save').mockRejectedValue(error);
    const defaultSave = jest.spyOn(repository, 'save');

    await expect(service.create(datos, manager)).rejects.toBe(error);

    expect(defaultSave).not.toHaveBeenCalled();
  });
});
