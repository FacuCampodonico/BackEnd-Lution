# BackEnd-Lution

API REST construida con [NestJS](https://nestjs.com/) y TypeScript.

## Requisitos

- Node.js 20+

## Instalación

```bash
npm install
cp .env.example .env
```

## Uso

```bash
npm run start:dev    # desarrollo con recarga automática
npm run build        # compila a dist/
npm run start:prod   # ejecuta la build
npm run lint         # eslint + prettier
npm test             # tests unitarios
npm run test:e2e     # tests end-to-end
```

El servidor arranca en `http://localhost:3000/api` por defecto. Todas las rutas
cuelgan del prefijo `/api`, configurado con `setGlobalPrefix` en `src/main.ts`.

## Estructura

El proyecto se organiza **por módulos**: cada funcionalidad vive en su carpeta
con todas sus capas dentro, y se registra en `AppModule`.

```
src/
├── main.ts                 arranque: prefijo /api, CORS y ValidationPipe global
├── app.module.ts           módulo raíz, importa config y el resto de módulos
├── config/
│   └── configuration.ts    variables de entorno tipadas
├── health/
│   ├── health.module.ts
│   ├── health.controller.ts
│   └── health.service.ts
└── empleado/
    ├── empleado.module.ts      declara controlador y providers
    ├── empleado.controller.ts  traduce HTTP ↔ dominio
    ├── empleado.service.ts     reglas de negocio
    ├── empleado.repository.ts  acceso a datos
    ├── dto/                    validación de la entrada
    └── entities/               forma de la entidad de dominio
```

Las capas van en un solo sentido: **controller → service → repository**. El
controlador no contiene lógica de negocio y el servicio no sabe nada de HTTP,
así que cambiar de base de datos solo toca la capa de repositorio.

Nest resuelve las dependencias por el constructor: basta con marcar la clase
`@Injectable()` y declararla en `providers` para que llegue donde se pida.

Para añadir una entidad:

```bash
npx nest g resource nombre
```

## Validación

El `ValidationPipe` global de `src/main.ts` valida el body contra el DTO antes
de que el controlador se ejecute:

- `whitelist` descarta propiedades no declaradas en el DTO.
- `forbidNonWhitelisted` responde `400` si llegan propiedades de más.
- `transform` convierte el payload a la clase del DTO.

Las reglas se declaran con decoradores de `class-validator`:

```ts
export class CrearempleadoDto {
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;
}
```

## Manejo de errores

Lanza las excepciones de Nest desde los servicios; el filtro integrado las
convierte en la respuesta HTTP correspondiente:

```ts
throw new NotFoundException(`empleado ${id} no encontrado`);
throw new ConflictException('Ya existe un empleado con ese email');
```

## Imports de tipos

El `tsconfig.json` tiene `isolatedModules` y `emitDecoratorMetadata` activados.
Un tipo que solo se usa como tipo dentro de una firma decorada debe importarse
con `import type`, o el compilador falla con `TS1272`:

```ts
import { empleadoService } from './empleado.service';     // se usa en runtime (DI)
import type { empleado } from './entities/empleado.entity'; // solo es un tipo
```

La excepción son los DTO: se importan como valor porque el `ValidationPipe`
necesita la clase en runtime.

## Endpoints

| Método | Ruta                | Descripción                    |
| ------ | ------------------- | ------------------------------ |
| GET    | `/api/health`       | Estado del servidor            |
| GET    | `/api/empleado`     | Lista todos los empleado       |
| POST   | `/api/empleado`     | Crea un empleado                |
| GET    | `/api/empleado/:id` | Obtiene un empleado por su `id` |

`POST /api/empleado` espera `{ "email": "...", "nombre": "..." }` y responde
`201`. Devuelve `400` si los datos son inválidos y `409` si el email ya existe.

> El repositorio de empleado guarda los datos **en memoria**: se pierden al
> reiniciar el servidor. Es el punto donde conectar una base de datos real.
