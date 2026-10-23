# Deploy de Lution

Producción: **https://lution.virtus-cs.tech**, en el VPS `187.77.245.161` (el mismo de Reservas y AthletiQ).
Traefik ya está en el VPS (`/docker/traefik`) y saca el certificado de Let's Encrypt solo.

## Primera vez

1. DNS: registro A `lution` → `187.77.245.161`.
2. Copiar los dos repos al VPS, uno al lado del otro, en `/srv/lution/`:

   ```bash
   rsync -az --delete --exclude node_modules --exclude dist --exclude coverage \
     --exclude '.env' --exclude 'deploy/api.env' --exclude .git \
     ./ root@187.77.245.161:/srv/lution/BackEnd-Lution/
   rsync -az --delete --exclude node_modules --exclude dist --exclude '.env' --exclude .git \
     ../FrontEnd-Lution/ root@187.77.245.161:/srv/lution/FrontEnd-Lution/
   ```

3. En `/srv/lution/BackEnd-Lution/deploy/`, crear `.env` y `api.env` a partir de los `.example`
   (contraseñas y `JWT_SECRET` con `openssl rand -hex 32`).
4. Levantar la base sola, cargar el dump y después el resto:

   ```bash
   docker compose up -d db
   docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" lution_dsw' < lution.sql
   docker compose up -d --build
   ```

## Actualizar

Repetir el rsync del repo que cambió y `docker compose up -d --build api` (o `web`).
Deployar siempre desde `main`.

## Cambios en las entidades

Producción corre con `DB_SYNC=false`: la API **no** toca el esquema. Si una entidad cambia, hay que aplicar
el cambio a mano (`ALTER TABLE ...`) antes de deployar. Prender `synchronize` en producción puede borrar
columnas con sus datos.

## Contraseña de un empleado

```bash
docker compose exec api node dist/scripts/crear-admin.js <dni> <password>
```
