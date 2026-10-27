# Hipermaxi – E-commerce conectado a Dolibarr

Prototipo de tienda en línea para el supermercado Hipermaxi (proyecto UCATEC).
Hecho con React 19, Vite, Tailwind 4 y componentes shadcn. Los productos, pedidos y
facturas se leen y guardan en Dolibarr mediante su API REST.

> Es solo para uso local, no está pensado para publicarse.

## 1. Requisitos

- **Node.js LTS** (versión 20 o superior): https://nodejs.org → descarga la versión "LTS".
- **Git**: https://git-scm.com/downloads

Para comprobar que quedaron instalados, abre una terminal y ejecuta:

```bash
node -v
git --version
```

## 2. Descargar el proyecto

```bash
git clone https://github.com/ArianaAguilar-0/hipermaxi-ecommerce.git
cd hipermaxi-ecommerce
npm install
```

## 3. Configurar la conexión a Dolibarr

1. Copia el archivo de ejemplo:
   - Windows (CMD): `copy .env.example .env.local`
   - PowerShell, Git Bash, Mac o Linux: `cp .env.example .env.local`
2. Abre `.env.local` y completa los valores (pídeselos a la dueña del proyecto):

```env
DOLIBARR_URL=https://tu-instancia.dolicloud.com
DOLIBARR_API_KEY=tu_api_key
```

- `DOLIBARR_URL` es la dirección base, **sin** `/api/index.php` y sin `/` al final.
- `.env.local` **no se sube a GitHub** (está en `.gitignore`). Nunca compartas la key por el repositorio.

## 4. Ejecutar

```bash
npm run dev
```

Abre http://localhost:5173 en el navegador.

Otros comandos:

| Comando | Para qué sirve |
|---|---|
| `npm run lint` | Revisa errores en el código |
| `npm run build` | Genera la versión de producción en `dist/` |

## ¿Cómo se protege la API key?

El navegador nunca ve la key. La app llama a `/api/index.php/...` y el **proxy de Vite**
(configurado en `vite.config.js`) reenvía la petición a Dolibarr agregando el header
`DOLAPIKEY` con la key de `.env.local`. Si un usuario inició sesión, se envía su propio
token y el proxy no lo reemplaza.

Por eso, en local, la conexión **solo funciona con `npm run dev`**: si abres el `dist/`
compilado sin un servidor que haga de proxy, las llamadas a `/api` fallarán. En Vercel ese
trabajo lo hace la función `api/dolibarr.js` (ver la sección siguiente).

## Publicación en Vercel

La versión publicada sale de la rama **`publicacion`**. La rama `main` y `npm run dev` siguen
funcionando igual en local.

En producción no existe el proxy de Vite: lo reemplaza la función de servidor
[`api/dolibarr.js`](api/dolibarr.js). `vercel.json` envía `/api/*` a esa función y el resto de
las rutas a `index.html` (así funcionan las rutas de React al recargar la página). La función:

- reenvía a Dolibarr solo los endpoints que usa la app (lista blanca); cualquier otro responde **403**;
- agrega la key de servicio solo si la petición no trae el token del usuario;
- rechaza `DELETE` y las escrituras de productos, categorías de productos y stock si no traen el token
  del administrador (la key de servicio nunca las hace);
- limita a 120 peticiones por minuto por IP, espera como máximo 25 s a Dolibarr y no reintenta POST/PUT.

### Pasos para publicar

1. Sube la rama: `git push origin publicacion`.
2. Entra a https://vercel.com con tu cuenta de GitHub → **Add New… → Project** → importa el repositorio.
3. Framework: **Vite** (Vercel lo detecta). Comando de build: `npm run build`. Carpeta de salida: `dist`.
4. En **Environment Variables** agrega (para *Production*):
   - `DOLIBARR_URL` = la URL base de Dolibarr, **sin** `/api/index.php` (la misma de `.env.local`).
   - `DOLIBARR_API_KEY` = la key del usuario de servicio.
   No uses el prefijo `VITE_`: así la key nunca llega al navegador.
5. Presiona **Deploy**.
6. En **Settings → Git → Production Branch** escribe `publicacion` y guarda. Desde ahí, cada
   `git push origin publicacion` vuelve a publicar la tienda.

Si cambias una variable de entorno, vuelve a publicar (**Deployments → … → Redeploy**) para que se aplique.

### Cómo desactivar la publicación

- **Pausar:** en el proyecto de Vercel → **Settings → General → Pause Project** (la URL deja de
  responder hasta que lo reanudes).
- **Cortar el acceso a Dolibarr:** borra la variable `DOLIBARR_API_KEY` en Vercel y vuelve a publicar;
  la tienda carga, pero sin datos.
- **Eliminar:** **Settings → General → Delete Project**. Si la key estuvo publicada, genera una nueva
  en Dolibarr para el usuario de servicio.

## Estructura de carpetas

```
api/
└── dolibarr.js       Función de Vercel que reemplaza al proxy de Vite en producción
src/
├── pages/            Páginas (Inicio, detalle de producto, admin, NotFound…)
├── layouts/          Header, Footer y layout de la tienda
├── componentes/      Componentes propios agrupados por funcionalidad
├── components/ui/    Componentes shadcn
├── context/          AuthContext y CartContext
├── hooks/            Hooks personalizados
├── services/         Llamadas a Dolibarr (un archivo por recurso)
├── routes/           AppRoutes.jsx con todas las rutas
├── Moleculas/        Skeleton de carga
└── shimer/pulse/     Estados vacío y de error
```

## Problemas comunes

| Problema | Solución |
|---|---|
| En la consola aparece `Faltan DOLIBARR_URL o DOLIBARR_API_KEY` | No existe `.env.local` o tiene los nombres mal escritos. Revísalo y **reinicia** `npm run dev`. |
| Cambié `.env.local` y no pasa nada | Vite solo lee `.env.local` al arrancar: detén con `Ctrl + C` y vuelve a ejecutar `npm run dev`. |
| "No se pudo conectar con Dolibarr" | Revisa que `DOLIBARR_URL` sea correcta (sin `/api/index.php`) y que la instancia esté en línea. |
| Error 401 (No autorizado) | La API key o el token no son válidos. Genera una nueva key en la ficha del usuario de Dolibarr. |
| Error 403 (Acceso denegado) | El usuario de Dolibarr no tiene el permiso necesario (por ejemplo, leer productos). Hay que dárselo en Dolibarr. |
| Error 404 en `/api/...` | El módulo "API REST" no está activado en Dolibarr, o la URL está mal. |
| `npm` o `node` no se reconoce | Node no está instalado o hay que cerrar y abrir la terminal después de instalarlo. |
| El puerto 5173 está ocupado | Vite usará otro puerto automáticamente; mira la dirección que muestra en la terminal. |
| Errores al instalar dependencias | Borra la carpeta `node_modules` y ejecuta `npm install` otra vez. No uses `npm audit fix --force`. |
