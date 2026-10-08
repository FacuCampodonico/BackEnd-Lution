# Respuestas listas para el frontend

Los endpoints consumidos por FrontEnd-Lution devuelven modelos completos. El
backend carga las relaciones, calcula resúmenes y serializa los IDs como texto y
los importes/stock como números. El frontend recibe `data` directamente y no
une respuestas de varios endpoints.

Los controllers delegan cada operación en un único método del service. Los
services transforman las entidades en modelos de respuesta, calculan los
resúmenes y devuelven el pedido actualizado tras modificar sus ítems. Los
repositories cargan las relaciones y mantienen las entidades de persistencia.
Un interceptor HTTP conserva el JSON `null` cuando una mesa no tiene pedido
abierto; el service devuelve `null` y el controller solo delega la consulta.

Las entidades de persistencia siguen usando IDs numéricos. Los bodies existentes
mantienen sus DTOs: por ejemplo, producto recibe `idCategoria`, insumo recibe
`stockDisponible`/`unidadMedida` y empleado recibe `dni`/`idTipoRol`/`password`.
La única columna nueva es `empleado.password_hash`, que agrega el login.

## Autenticación

Todas las rutas exigen `Authorization: Bearer <accessToken>`, salvo
`POST /api/auth/login` y `GET /api/health`.

`POST /api/auth/login` recibe `{ "dni": "11111111", "password": "admin1234" }` y
responde `200`:

```json
{
  "accessToken": "eyJhbGciOi...",
  "empleado": {
    "id": "2",
    "nombre": "Administrador",
    "dni": "11111111",
    "rolNombre": "Admin",
    "nivel": "admin"
  }
}
```

Si el DNI no existe, la contraseña no coincide o el empleado no tiene
contraseña, responde `401` con el mensaje `DNI o contraseña incorrectos`.

`GET /api/auth/me` devuelve el mismo objeto `empleado`, releído de la base.

El token es un JWT con `{ sub: empleadoId, nivel }`, firmado con `JWT_SECRET`
y con vencimiento `JWT_EXPIRES_IN` (por defecto `8h`). El backend no arranca si
falta `JWT_SECRET`.

| Situación | Respuesta |
| --- | --- |
| Falta el token, es inválido o está vencido | `401` |
| El token es válido pero el nivel no alcanza | `403` `No tenés permisos para esta acción` |

### Niveles de acceso

El nivel sale del rol del empleado: `Admin` es `admin`; `Cajero`, `Barra` y
`Mozo` son `mozo`. Toda ruta que no figure en la tabla es solo para `admin`.

| Ruta | admin | mozo |
| --- | --- | --- |
| `POST /auth/login`, `GET /health` | sin token | sin token |
| `GET /auth/me` | sí | sí |
| `GET /mesas`, `GET /mesas/:id`, `POST /mesas` | sí | sí |
| `GET /mesas/:mesaId/pedido`, `POST /mesas/:mesaId/pedido` | sí | sí |
| `POST /pedidos/:pedidoId/items` | sí | sí |
| `PATCH /pedidos/:pedidoId/items/:itemId`, `DELETE /pedidos/:pedidoId/items/:itemId` | sí | sí |
| `GET /productos` | sí | sí |
| Todo lo demás (cobrar, cerrar mesa, ABM de catálogo, empleados, insumos, pagos) | sí | no |

`POST /mesas/:mesaId/pedido` toma el empleado del token. El campo `empleadoId`
del body se acepta por compatibilidad, pero se ignora.

### Empleados y contraseñas

`POST /empleados` exige `password` (texto, mínimo 6 caracteres). Se guarda el
hash bcrypt y ninguna respuesta lo devuelve.

Para crear el primer admin o asignar una contraseña a un empleado existente:

```bash
npm run crear-admin -- <dni> <password> [nombre] [--rol <rol>]
```

Si el DNI no existe, crea el empleado (nombre `Administrador` y rol `Admin` por
defecto). Si existe, cambia la contraseña; el rol solo cambia si se pasa `--rol`.

## Formatos de respuesta

Todas las rutas tienen el prefijo `/api`.

| Recurso | Rutas de lectura | Respuesta |
| --- | --- | --- |
| Categorías | `GET /categorias`, `GET /categorias/:id` | `{ id, nombre, productoIds }` |
| Productos | `GET /productos`, `GET /productos/:id` | `{ id, nombre, descripcion, precio, categoriaId, categoriaNombre, insumoIds }` |
| Mesas | `GET /mesas`, `GET /mesas/:id` | `{ id, numero, estado, pedidoActualId, totalActual, cantidadItems }` |
| Pedidos | `GET /pedidos`, `GET /pedidos/:id` | `{ id, mesaId, estado, total, items }` |
| Pedido abierto | `GET /mesas/:mesaId/pedido` | Un pedido completo o JSON `null` |
| Ítems | `GET /pedidos/:id/items` | Lista de `{ id, productoId, productoNombre, precioUnitario, cantidad }` |
| Insumos | `GET /insumos`, `GET /insumos/:id` | `{ id, nombre, stock, unidad }` |
| Empleados | `GET /empleados`, `GET /empleados/:id` | `{ id, nombre, apellido, dni, idTipoRol, rolNombre, rol, activo }` |

Los listados devuelven arrays. Las altas y actualizaciones de catálogo devuelven
el mismo modelo que la lectura de detalle. Categorías cargan productos;
productos cargan categoría y recetas; empleados cargan tipo de rol.

`numero` de mesa es texto en la respuesta. Las unidades de insumo son
`kg | litros | unidades | gramos | mililitros`. `rol` de empleado es `mozo | admin`
si se reconoce el nombre de su relación; en otro caso es `null`. Como no hay
columnas de apellido ni activo, se conserva el nombre completo en `nombre`,
`apellido` queda vacío y `activo` es `null`.

## Pedidos y mesas

El listado de mesas carga en un join solo los pedidos abiertos, sus ítems y los
productos. El filtro está en el `LEFT JOIN`, de modo que las mesas libres siguen
apareciendo. El resumen suma cantidades y calcula el total del pedido abierto;
si no hay pedido, devuelve `pedidoActualId: null` y ambos totales en cero.

Crear un pedido en `POST /mesas/:id/pedido` devuelve el pedido completo. También
lo devuelven `POST /pedidos/:id/items`, `PATCH /pedidos/:id/items/:itemId` y
`DELETE /pedidos/:id/items/:itemId`, después de completar la mutación. No se
necesita otro GET desde el frontend.

El total de los pedidos abiertos se calcula con los precios actuales de sus
productos. Para pedidos pagados se usa el total guardado al cobrar.

## Cobro

`POST /pedidos/:id/pago` recibe el DTO de pago existente y devuelve:

```json
{
  "message": "Pago registrado con éxito",
  "pedidoId": "6",
  "total": 200.5,
  "vuelto": 9.5
}
```

El pedido queda pagado y la mesa queda en `por_pagar`. Liberar la mesa sigue
siendo una operación aparte: `POST /mesas/:id/cerrar`. Si falla ese cierre, se
puede reintentar sin cobrar de nuevo. El CRUD de pagos aislados en `/pagos` no es
el endpoint para cobrar pedidos y conserva su contrato anterior.

## Verificación

`npm test -- --runInBand` ejecuta pruebas HTTP con los controllers y servicios
reales, usando persistencia en memoria, y comprueba el SQL que genera TypeORM
para los joins sin conectarse a MySQL. `npm run build` comprueba TypeScript.
Estas pruebas no ejecutan SQL contra la base de datos local.
