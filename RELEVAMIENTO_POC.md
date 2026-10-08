# Relevamiento del repositorio BackEnd-Lution para la PoC NestJS vs AdonisJS

> Convención: **[V]** = verificado leyendo el código/paquetes. **[I]** = inferido (comportamiento esperado
> de la librería, no ejecutado). **[D]** = duda / ambigüedad a resolver por el equipo.

## Resumen

1. El repo es **chico y temprano**: 57 archivos versionados, ~1.230 líneas de código en `src/` en 8 módulos, 16 commits (ago–sep 2026). NestJS 11.1, TypeORM 1.1, MySQL (mysql2), esquema por `synchronize: true`, sin migraciones. [V]
2. De las 6 entidades de la PoC existen 4 (Mesa, Pedido, Empleado, EmpleadoTipoRol) y Producto sin **precio**. **PedidoProducto no existe** y Pedido no tiene relación con Producto. [V]
3. `Producto` tiene FK obligatoria a `Categoria` (módulo fuera de alcance): arrastra una tabla extra. [V]
4. Del contrato de 12 endpoints: 2 existen igual (`GET /mesa`, `GET /mesa/:id`), 6 existen pero difieren y **4 de pedido faltan** (crear, agregar producto, quitar producto, cerrar; el POST está comentado). [V]
5. **Ninguna regla de negocio de la PoC está implementada**: no hay 409 por mesa ocupada ni por pedido cerrado, no hay cálculo de total, las fechas y el total los manda el cliente, no hay transacciones. [V]
6. No hay guards, auth, interceptores, filtros ni middlewares: el acoplamiento es bajo. Solo hay config global (prefijo `/api`, CORS, ValidationPipe). [V]
7. Estilo no idiomático para una comparación justa: una **capa `*Repository` propia que solo envuelve** el `Repository` de TypeORM, DTOs de actualización **sin decoradores** (con `forbidNonWhitelisted` rompen el PATCH), código comentado, `DECIMAL` que vuelve como string. [V]/[I]
8. No hay tests, colecciones de Postman, seeds, docker-compose ni `.env`. [V]
9. **Recomendación: opción C**, un proyecto Nest nuevo con el mismo alcance que Adonis, reutilizando las entidades existentes (ajustadas) y la configuración. La mayor parte del núcleo de la PoC hay que escribirla igual, y partir limpio da métricas comparables.

---

## 1. Panorama general

| Aspecto | Valor | Fuente |
|---|---|---|
| Node requerido | ≥ 20 (`@nestjs/core` engines); README dice "Node.js 20+" | `node_modules/@nestjs/core/package.json`, `README.md:7` [V] |
| Node en la máquina | v24.15.0 / npm 11.12.1 (se actualizó desde v12 en esta sesión) | [V] |
| NestJS | `@nestjs/common` / `core` 11.1.28, `@nestjs/config` 4.0.4, `@nestjs/typeorm` 11.0.3 | `node_modules` [V] |
| ORM | TypeORM 1.1.0 | [V] |
| Motor BD | MySQL vía `mysql2` 3.23.2 | `src/app.module.ts:23` [V] |
| Esquema | `synchronize: true` + `autoLoadEntities: true`. Sin migraciones ni SQL | `src/app.module.ts:29-30` [V] |
| Validación | `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) | `src/main.ts:13-19` [V] |
| Prefijo global | `app.setGlobalPrefix('api')`: todas las rutas son `/api/...` | `src/main.ts:10` [V] |
| CORS | `app.enableCors()` | `src/main.ts:11` [V] |
| TypeScript | 5.9.3, `strict`, `isolatedModules`, `emitDecoratorMetadata`, `module: nodenext` | `tsconfig.json` [V] |

**Configuración / variables de entorno** (`src/config/configuration.ts`, `.env.example`) [V]:
`PORT` (3000), `NODE_ENV`, `DB_HOST`, `DB_PORT` (3306), `DB_USER`, `DB_PASSWORD`, `DB_NAME` (`lution_dsw`).
No hay `.env` en el repo (solo `.env.example`). `ConfigModule` es global (`src/app.module.ts:15-18`).

**Scripts de `package.json`** [V]: `build`, `format`, `start`, `start:dev`, `start:debug`, `start:prod`, `lint`,
`test`, `test:watch`, `test:cov`, `test:debug`, `test:e2e` (apunta a `./test/jest-e2e.json`, **que no existe**).

**Dependencias**: 11 de producción, 23 de desarrollo [V]. `class-transformer` está declarada pero no se usa en `src/` [V]. El ValidationPipe con `transform: true` la necesita en runtime, así que no sobra. [I]

**README desactualizado** [V]: dice que el repositorio de empleado es "en memoria" y documenta un body con `email` que no existe (`README.md:118-122`).

## 2. Inventario de módulos

Conteo sobre archivos versionados en `src/` (líneas totales / líneas de código sin blancos ni comentarios, contadas con PowerShell porque no hay `cloc` ni `tokei`) [V]:

| Módulo | ¿Entra en la PoC? | Archivos | Líneas | Código | Contenido |
|---|---|---|---|---|---|
| (raíz) `main.ts`, `app.module.ts` | Sí (adaptado) | 2 | 72 | 62 | Bootstrap y módulo raíz |
| `config` | Sí | 1 | 16 | 15 | Config tipada desde env |
| `mesa` | **Sí** | 7 | 170 | 145 | CRUD completo |
| `pedido` | **Sí** | 7 | 238 | 187 | Solo GET/PATCH/DELETE (create comentado) |
| `empleado` | Parcial: entidades sí, CRUD no (seed) | 8 | 323 | 270 | Empleado + EmpleadoTipoRol + CRUD |
| `producto` | Parcial: entidad sí, CRUD no (seed) | 7 | 179 | 152 | CRUD, FK a Categoria |
| `categoria` | No (pero Producto depende de ella) | 7 | 156 | 132 | CRUD |
| `insumo` | No | 7 | 276 | 232 | CRUD, enum de unidades |
| `health` | No | 3 | 42 | 35 | `GET /api/health` |
| **Total** | | **49** | **1.472** | **1.230** | |

## 3. Entidades del núcleo

### Mesa: `src/mesa/entities/mesa.entity.ts` [V]
| Campo | Tipo | Restricciones |
|---|---|---|
| `id` | int PK autoincrement | |
| `numero` | int | `unique` |
| `estado` | varchar(50) | default `'libre'`, texto libre (sin enum) |
| `pedidos` | OneToMany → Pedido | |

- Coincide: id, número, relación con pedidos.
- Sobra: `estado` [D]. El alcance no lo menciona; con la regla "una mesa no puede tener dos pedidos abiertos", el estado se puede derivar de los pedidos. Hay que decidir si va en ambas versiones o en ninguna.

### Pedido: `src/pedido/entities/pedido.entity.ts` [V]
| Campo | Columna | Tipo | Restricciones |
|---|---|---|---|
| `id` | id | int PK | |
| `fechaHoraInicio` | fecha_hora_inicio | datetime | NOT NULL, **sin default** (L16-20) |
| `fechaHoraCierre` | fecha_hora_cierre | datetime | nullable (L22-27) |
| `total` | total | decimal(10,2) | nullable, tipado `number` (L29-35) |
| `empleadoId` | empleado_id | int | NOT NULL, FK → empleado (L37-51) |
| `mesaId` | mesa_id | int | NOT NULL, FK → mesa (L43-55) |

- Falta: relación con Producto / PedidoProducto (no hay `OneToMany` a líneas de pedido).
- "Abierto" = `fechaHoraCierre IS NULL` es lo más natural, pero no está definido en el código [I].
- Los `ManyToOne` no definen `onDelete`, así que MySQL crea la FK con RESTRICT por defecto [I].

### Empleado: `src/empleado/entities/empleado.entity.ts` [V]
`id`, `nombre` varchar(100), `dni` varchar(15) **unique**, `idTipoRol` (col `id_tipo_rol`) int NOT NULL, FK → EmpleadoTipoRol, `pedidos` OneToMany.
- Sobra respecto del alcance: nada grave; `dni` es un campo extra [D] (depende de lo que tenga Adonis).

### EmpleadoTipoRol: `src/empleado/entities/empleado-tipo-rol.entity.ts` [V]
`id`, `nombre` varchar(45), `empleados` OneToMany. Coincide.

### Producto: `src/producto/entities/producto.entity.ts` [V]
`id`, `nombre` varchar(120), `descripcion` varchar(255) NOT NULL, `idCategoria` (col `id_categoria`) int NOT NULL, FK → Categoria.
- **Falta `precio`**, que es imprescindible para calcular el total.
- **Sobra la FK a Categoria**, que obliga a crear y sembrar la tabla `categoria` (fuera de alcance).
- `descripcion` es obligatoria [D].

### PedidoProducto: **no existe** [V]
No hay entidad, tabla ni relación. Hay que crearla: PK compuesta (`pedido_id`, `producto_id`), `cantidad` int, `comentario` varchar nullable. En TypeORM lo idiomático es una entidad explícita con dos `@PrimaryColumn` y dos `@ManyToOne` (no `@ManyToMany`, porque tiene datos propios).

### Columnas DECIMAL
- `Pedido.total` (y `Insumo.stockDisponible`, fuera de alcance) son `decimal(10,2)` tipadas como `number`.
- **Vuelven como string** [V a nivel de driver]: mysql2 lee DECIMAL como string salvo que se configure `decimalNumbers: true` (`node_modules/mysql2/lib/parsers/text_parser.js:51-56`), y `app.module.ts` no lo configura. No hay `transformer` en las entidades. El tipo TS `number` es entonces incorrecto en runtime, y la respuesta JSON tendría `"total": "1234.50"` [I, no ejecutado contra BD].
- Para la PoC hay que decidir cómo serializarlo (número o string) **igual en Nest y Adonis** [D]. Lucid también devuelve DECIMAL de MySQL como string por defecto [I].

## 4. Endpoints existentes vs contrato objetivo

Todas las rutas existentes llevan el prefijo `/api` (`src/main.ts:10`); el contrato no lo lleva [D: definir si ambas APIs usan `/api` o ninguna].

| Contrato | Estado | Detalle | Ref. |
|---|---|---|---|
| `GET /mesa` | Existe igual | Lista sin relaciones | `src/mesa/mesa.controller.ts:15-18` |
| `GET /mesa/:id` | Existe igual | 404 si no existe; 400 si id no numérico (`ParseIntPipe`) | `mesa.controller.ts:20-23`, `mesa.service.ts:18-24` |
| `POST /mesa` | Existe pero difiere | Body `{numero}` validado. `numero` duplicado da error de unique de MySQL, que termina en **500**, no 409 [I] | `mesa.controller.ts:10-13`, `dto/crear-mesa.dto.ts` |
| `PATCH /mesa/:id` | Existe pero difiere | Solo acepta `estado` (string libre); **no permite editar `numero`**. Devuelve la mesa actualizada | `mesa.controller.ts:25-31`, `dto/actualizar-mesa.dto.ts` |
| `DELETE /mesa/:id` | Existe pero difiere | Devuelve 200 con cuerpo vacío. Con pedidos asociados la FK RESTRICT da un error de MySQL, que termina en **500, no 409** [I] | `mesa.controller.ts:33-36`, `mesa.service.ts:31-34` |
| `GET /pedido` | Existe pero difiere | `find()` **sin relaciones**: no incluye mesa, empleado ni productos. `total` como string [I] | `pedido.controller.ts:23-26`, `pedido.repository.ts:20-22` |
| `GET /pedido/:id` | Existe pero difiere | `findOneBy` sin relaciones; 404 ok | `pedido.controller.ts:34-37`, `pedido.repository.ts:24-26` |
| `POST /pedido` | **Falta** | Está **comentado** en controller, service y repository, con ruta `crear-pedido`. El DTO existente pide `fechaHoraInicio`, `fechaHoraCierre` y `total` al cliente (viola "las fechas las pone el servidor") y no tiene productos | `pedido.controller.ts:28-32`, `pedido.service.ts:13-15`, `pedido.repository.ts:15-18`, `dto/crear-pedido.dto.ts` |
| `POST /pedido/:id/productos` | **Falta** | | |
| `DELETE /pedido/:id/productos/:productoId` | **Falta** | | |
| `POST /pedido/:id/cerrar` | **Falta** | | |
| `DELETE /pedido/:id` | Existe pero difiere | 200 con `{message: 'Pedido eliminado correctamente'}` (el de mesa devuelve vacío: inconsistente). Cuando exista PedidoProducto va a necesitar borrar las líneas antes (cascade o transacción) | `pedido.controller.ts:47-56` |

**Endpoints existentes que no están en el contrato:**

| Endpoint | Observación |
|---|---|
| `PATCH /api/pedido/:id` | `ActualizarPedidoDto` **no tiene decoradores** (`dto/actualizar-pedido.dto.ts`). Con `whitelist` + `forbidNonWhitelisted`, cualquier propiedad enviada da **400** ("property X should not exist"), así que en la práctica el endpoint no sirve [I]. Además permitiría editar total y fechas desde el cliente |
| `GET/POST/PATCH/DELETE /api/empleado[...]` | Fuera de alcance (empleados por seed). POST en `/empleado/crear-empleado` |
| `GET/POST/PATCH/DELETE /api/producto[...]` | Fuera de alcance (productos por seed). El PATCH tiene el mismo problema de DTO sin decoradores |
| `/api/categoria`, `/api/insumo`, `/api/health` | Fuera de alcance |

## 5. Reglas de negocio

| Regla | Estado | Dónde / comentario |
|---|---|---|
| Mesa no puede tener dos pedidos abiertos (409) | **No implementada** | No existe el alta de pedido |
| Pedido cerrado no se puede modificar (409) | **No implementada** | No hay endpoints de productos ni de cierre; el PATCH genérico no chequea nada |
| Total = Σ cantidad × precio | **No implementada** | No hay precio ni líneas; `total` viene del cliente en el DTO de alta comentado |
| Fechas las pone el servidor | **No implementada** | `fechaHoraInicio` sin default ni `@CreateDateColumn`; el DTO la pide al cliente |
| Borrar mesa con pedidos → 409 | **No implementada** | Hoy termina en 500 por FK [I] |
| Crear pedido con productos en transacción | **No implementada** | No se usa `DataSource`, `QueryRunner` ni `transaction` en ningún lado (grep sin resultados) |
| 404 por id inexistente | Implementada | `mesa.service.ts:18-24`, `pedido.service.ts:21-27` |
| DNI de empleado único → 409 | Implementada (fuera de alcance) | `empleado.service.ts:39-50` |

## 6. Acoplamientos

| Tipo | Hallazgo | Impacto para aislar el núcleo |
|---|---|---|
| Guards / auth | Ninguno (grep de `UseGuards`/`APP_GUARD` sin resultados) [V] | Nulo |
| Interceptores / filtros / middlewares | Ninguno [V] | Nulo. Los errores de BD salen como 500 por el filtro por defecto |
| Config global | Prefijo `/api`, CORS, ValidationPipe estricto, `ConfigModule` global [V] | Bajo: replicar igual en Adonis o quitar el prefijo |
| FK fuera de alcance | **Producto → Categoria** (NOT NULL) [V] | Hay que mantener la tabla `categoria` y sembrarla, o quitar la FK |
| Entidades cruzadas | Mesa↔Pedido y Empleado↔Pedido se importan entre módulos. Funciona porque cada módulo registra su entidad con `forFeature` y `autoLoadEntities` las junta [V] | Si se elimina un módulo, sus entidades dejan de cargarse y las relaciones fallan en runtime [I] |
| Módulos exportados | Mesa y Producto exportan su Service y Repository; Pedido y Empleado exportan su Service. **Ningún módulo importa a otro** (`PedidoModule` no importa Mesa, Empleado ni Producto) [V] | Para validar mesa, empleado y productos al crear el pedido habrá que inyectar repositorios de otras entidades |
| `synchronize: true` | [V] | Riesgo si se apunta a una BD real: altera el esquema al arrancar. Para la PoC conviene una BD dedicada |
| Import con ruta absoluta `src/...` | `src/insumo/insumo.service.ts:4` [V] | Fuera de alcance; solo compila porque el import se usa como tipo [I] |

## 7. Qué tan idiomático es el código Nest

**Patrones propios que sesgarían la comparación:**
- **Capa `XxxRepository` envoltorio** en todos los módulos (p. ej. `src/mesa/mesa.repository.ts`, `src/pedido/pedido.repository.ts`): una clase `@Injectable` que recibe `@InjectRepository(Entity)` y reexpone `find`, `findOneBy`, `update` y `delete` casi 1:1. Suma un archivo y unas 35 líneas por módulo sin aportar lógica. Lo idiomático en Nest+TypeORM es inyectar `Repository<Entity>` directo en el service. En Adonis el equivalente sería llamar al modelo Lucid desde el controller o el service, así que **esta capa infla las métricas de Nest** [V/I].
- **Estilos inconsistentes entre módulos** [V]: mesa, producto y categoria usan `POST /recurso`, `findOne` y `remove`; empleado, insumo y pedido usan `POST /recurso/crear-recurso`, `findById` y `delete`, con respuesta `{message}`.
- **Código muerto comentado** en pedido (controller, service y repository) [V].
- **DTOs de actualización a mano y sin validación** en lugar de `PartialType` (`@nestjs/mapped-types`, que no está instalado) [V].
- Imports sin uso (`IsEmail` en los DTOs de pedido y empleado, `HttpCode`/`HttpStatus` en `pedido.controller.ts`) [V].

**Validación**: `ValidationPipe` global + class-validator en los DTOs de alta. Los de actualización (pedido, producto, empleado) no tienen decoradores. Con `forbidNonWhitelisted` eso rompe los PATCH de pedido y producto [I]. Empleado igual responde 400 [I].

**Errores**: excepciones de Nest (`NotFoundException`, `ConflictException`) lanzadas desde los services. No hay traducción de errores de BD (unique, FK), que terminan en 500 [I].

**Transacciones**: no se usan en ningún lado [V].

## 8. Tests y herramientas

| Elemento | Estado |
|---|---|
| Tests unitarios (`*.spec.ts`) | **Ninguno** [V] |
| Tests e2e | **Ninguno**. No existe la carpeta `test/` aunque `test:e2e` apunta a `test/jest-e2e.json` [V] |
| Config Jest | En `package.json` (`rootDir: src`, ts-jest) [V] |
| Postman / `.http` | Ninguno [V] |
| Seeds | Ninguno [V] |
| Migraciones / SQL | Ninguno (`synchronize: true`) [V] |
| docker-compose | No [V] |
| `.env` | No versionado; solo `.env.example` [V] |
| ESLint / Prettier | `eslint.config.mjs`, `.prettierrc` (config de `nest new`) [V] |

## 9. Opciones y recomendación

Lo que falta para cumplir el contrato es casi igual en las tres opciones: PedidoProducto, `precio`, alta de pedido transaccional, agregar y quitar producto, cierre con total, 409 de negocio, relaciones en los GET, seed y fechas del servidor. La mayor parte del núcleo hay que escribirla de cero en cualquier caso. Lo que cambia entre opciones es **qué se arrastra**.

### A) Usar el repo tal cual, agregando lo que falte
- **Esfuerzo**: el menor a corto plazo (~6–8 h estimadas [I]).
- **Riesgos**: las métricas incluirían insumo, categoria, health y el CRUD de empleado y producto (~45 % del código fuera de alcance). Además hay que agregar `precio` y convivir con la FK a Categoria. Las inconsistencias de estilo quedan.
- **Comparación justa**: **no**. Distinto alcance y distinta cantidad de archivos y endpoints que Adonis.

### B) Copia recortada (branch o carpeta) eliminando lo que no es núcleo
- **Esfuerzo**: ~7–9 h [I] (recortar, arreglar lo roto y luego lo mismo que A).
- **Riesgos**: se hereda la capa Repository envoltorio, los DTOs sin validar, el código comentado y el estilo mixto. Limpiar todo eso equivale casi a reescribirlo. Hay que decidir qué hacer con Categoria (quitar la FK implica cambiar la entidad igual). El historial git mezcla trabajo previo con trabajo de la PoC, lo que complica medir horas.
- **Comparación justa**: parcial. El alcance se iguala, pero el código queda con patrones no idiomáticos salvo que se refactorice.

### C) Proyecto Nest nuevo desde cero, reutilizando lo que sirva
- **Esfuerzo**: ~7–9 h [I]. `nest new` + TypeORM y config (~1 h), entidades adaptadas (~1 h), mesa (~1 h), pedido con transacción y reglas (~3 h), seed (~1 h), prueba con Postman (~1 h).
- **Reutilizable**: `configuration.ts`, la config de `main.ts` y `TypeOrmModule.forRootAsync`, las entidades Mesa, Empleado, EmpleadoTipoRol y Pedido (ajustadas), `CrearMesaDto`, y el patrón de 404 de los services.
- **Riesgos**: "tirar" código existente (poco: ~300 líneas útiles). Hay que igualar decisiones con Adonis (prefijo, formato de errores, DECIMAL).
- **Comparación justa**: **sí**. Mismo alcance, scaffolding oficial de cada framework, estilo idiomático (controller → service con `@InjectRepository`), y horas y líneas medidas desde cero igual que en Adonis.

### Recomendación: **C**
El repo aporta poco del núcleo de la PoC: faltan PedidoProducto, precio, 4 endpoints de pedido y todas las reglas de negocio, y lo que existe de pedido está a medio hacer. En cambio, sí introduce sesgos en las métricas (módulos extra, capa repository redundante, FK a Categoria). Un proyecto nuevo cuesta casi lo mismo que B y deja la versión Nest **con el mismo alcance e idiomática**, que es la condición para que las comparaciones de archivos, líneas, dependencias y horas tengan sentido. Conviene documentar en el TP qué se reutilizó del repo original.

## 10. Lista de tareas (opción C)

**Decisiones previas (acordar con la versión Adonis)** [D]:
1. ¿Prefijo `/api` o rutas sin prefijo? (el contrato no lo tiene).
2. Formato JSON de errores (409, 404, 400) y códigos de éxito (`POST` → 201, `DELETE` → 200 con cuerpo o 204).
3. `total` y `precio` en JSON: ¿number o string? Si es number, usar `decimalNumbers: true` en la conexión o un `transformer`.
4. ¿Mesa lleva `estado`? ¿Producto lleva `descripcion` y categoría? ¿Empleado lleva `dni`? Tienen que ser iguales en ambas versiones.
5. Criterio de "pedido abierto": `fecha_hora_cierre IS NULL`.

**Implementación:**
1. `npx @nestjs/cli new` en una carpeta o repo nuevo. Instalar solo `@nestjs/typeorm`, `typeorm`, `mysql2`, `@nestjs/config`, `class-validator`, `class-transformer` (y `@nestjs/mapped-types` si se usa `PartialType`). Registrar la lista de dependencias para las métricas.
2. Copiar y adaptar `src/config/configuration.ts` y la configuración de `main.ts` (ValidationPipe; prefijo según la decisión 1). TypeORM con `synchronize: true` contra una **BD dedicada a la PoC** (o migraciones, si Adonis las usa, para igualar).
3. Entidades: copiar Mesa, Empleado, EmpleadoTipoRol y Pedido. En Pedido, `fechaHoraInicio` con `@CreateDateColumn` o seteada en el service, y agregar `@OneToMany` a PedidoProducto. Producto con `precio decimal(10,2)`, sin Categoria. Nueva entidad **PedidoProducto** con PK compuesta (`pedido_id`, `producto_id`), `cantidad` y `comentario`, y FK a pedido con `onDelete: 'CASCADE'`.
4. **Seed** de EmpleadoTipoRol, Empleado y Producto (script `ts-node` con `DataSource`, o comando npm). Equivalente al seeder de Adonis.
5. Módulo **Mesa**: controller + service con `@InjectRepository(Mesa)` directo, sin capa repository. DTOs de alta y edición validados. En DELETE, contar pedidos y lanzar `ConflictException` (409) si hay alguno.
6. Módulo **Pedido**:
   - `GET /pedido` y `GET /pedido/:id` con `relations: { mesa, empleado, lineas: { producto } }`.
   - `POST /pedido`: DTO `{ mesaId, empleadoId, productos: [{ productoId, cantidad, comentario? }] }` con `@ValidateNested` y `@Type`. Validar que existan mesa, empleado y productos (404 o 400). **409 si la mesa tiene un pedido abierto**. Crear el pedido y las líneas dentro de `dataSource.transaction(...)`. Fecha de inicio puesta por el servidor.
   - `POST /pedido/:id/productos`: 409 si está cerrado. Definir qué pasa si el producto ya está en el pedido (sumar cantidad o 409) [D].
   - `DELETE /pedido/:id/productos/:productoId`: 409 si está cerrado; 404 si la línea no existe.
   - `POST /pedido/:id/cerrar`: 409 si ya está cerrado. Setea `fechaHoraCierre = now` y `total = Σ cantidad × precio` (calculado en el servidor).
   - `DELETE /pedido/:id`: borra las líneas por cascade.
7. Armar la **colección Postman** del contrato (casos felices + 404/409/400) y correrla contra Nest.
8. Métricas: contar archivos y líneas de `src/` (y del seed) con la misma herramienta en ambos proyectos (`cloc` o `tokei`, que no están instalados hoy), dependencias de `package.json` y horas registradas.
