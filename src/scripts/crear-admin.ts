import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Empleado } from '../empleado/entities/empleado.entity';
import { EmpleadoTipoRol } from '../empleado/entities/empleado-tipo-rol.entity';
import { hashearPassword } from '../common/utils/password';

const USO =
  'Uso: npm run crear-admin -- <dni> <password> [nombre] [--rol <rol>]';

interface Argumentos {
  dni: string;
  password: string;
  nombre: string;
  rol: string | null;
}

function leerArgumentos(argv: string[]): Argumentos {
  const posicionales: string[] = [];
  let rol: string | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--rol') {
      rol = argv[++i] ?? null;
      if (!rol) {
        throw new Error(`Falta el nombre del rol después de --rol.\n${USO}`);
      }
    } else if (arg.startsWith('--rol=')) {
      rol = arg.slice('--rol='.length);
    } else {
      posicionales.push(arg);
    }
  }

  const [dni, password, nombre] = posicionales;

  if (!dni || !password) {
    throw new Error(USO);
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  return { dni, password, nombre: nombre ?? 'Administrador', rol };
}

async function buscarRol(
  dataSource: DataSource,
  nombre: string,
): Promise<EmpleadoTipoRol> {
  const roles = await dataSource.getRepository(EmpleadoTipoRol).find();
  const rol = roles.find(
    (r) => r.nombre.toLowerCase() === nombre.toLowerCase(),
  );

  if (!rol) {
    const disponibles = roles.map((r) => r.nombre).join(', ');
    throw new Error(
      `No existe el rol '${nombre}'. Roles disponibles: ${disponibles}`,
    );
  }

  return rol;
}

async function main() {
  const args = leerArgumentos(process.argv.slice(2));

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);
    const empleados = dataSource.getRepository(Empleado);
    const passwordHash = await hashearPassword(args.password);

    const existente = await empleados.findOne({ where: { dni: args.dni } });

    if (existente) {
      const cambios: Partial<Empleado> = { passwordHash };
      if (args.rol) {
        cambios.idTipoRol = (await buscarRol(dataSource, args.rol)).id;
      }
      await empleados.update(existente.id, cambios);
    } else {
      const rol = await buscarRol(dataSource, args.rol ?? 'Admin');
      await empleados.save(
        empleados.create({
          nombre: args.nombre,
          dni: args.dni,
          idTipoRol: rol.id,
          passwordHash,
        }),
      );
    }

    const empleado = await empleados.findOneOrFail({
      where: { dni: args.dni },
      relations: { tipoRol: true },
    });

    console.log(
      `${existente ? 'Contraseña actualizada' : 'Empleado creado'}: ` +
        `id ${empleado.id}, DNI ${empleado.dni}, nombre '${empleado.nombre}', ` +
        `rol ${empleado.tipoRol.nombre}`,
    );
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
