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
`stockDisponible`/`unidadMedida` y empleado recibe `dni`/`idTipoRol`. No se cambian
la estructura de tablas ni los campos obligatorios de creación.

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
