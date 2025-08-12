# Wedding Live Photos — PocketBase

App web ligera para que los invitados suban **fotos en vivo** y la novia las vea en una **galería en tiempo real**.

## Estructura
- `index.html` – UI (nombre invitado, subida, galería, admin, QR)
- `style.css` – estilos
- `app.js` – lógica con PocketBase (subir/escuchar/moderar)

## Cómo publicar el frontend (GitHub Pages)
1. En este repo → **Settings → Pages**.
2. Source: **Deploy from a branch** → Branch: **main** → Folder: **/** (root).
3. Guarda. La URL quedará como `https://<tuusuario>.github.io/wedding-live-photos-pocketbase/`.

## Backend con PocketBase (rápido)
1. Despliega PocketBase en un host (Fly.io/Railway/Render). URL de ejemplo: `https://tu-app.fly.dev`.
2. En el **panel admin** (`/_/`) crea la colección **photos** con estos campos:
   - `event` (text, requerido, max 80)
   - `by` (text, requerido, max 80)
   - `approved` (bool, default false)
   - `image` (file, requerido, máx 10 MB, tipos: jpg/png/webp)
3. Habilita **Realtime** para la colección.
4. **Access rules** recomendadas para MVP:
   - `list`: `true`
   - `view`: `true`
   - `create`: `true`
   - `update`: `true`  *(permite que el botón “Aprobar/Ocultar” funcione; para mayor seguridad, más adelante podemos exigir auth)*
5. En la app (página web) pega tu **Backend URL** y guarda. ¡Listo!

## Uso
- Invitado escribe su nombre, sube foto y aparece en la galería cuando está **aprobada**.
- Admin: usar la clave de `app.js` (`ADMIN_KEY`) para activar **Modo moderación** y aprobar/ocultar.

> Sugerencias: cambiar `EVENT_CODE` y `ADMIN_KEY` en `app.js`. Cuando acabe el evento, deshabilita subidas cambiando reglas o deteniendo el backend.
