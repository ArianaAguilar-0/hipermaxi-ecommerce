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

Por eso la conexión **solo funciona con `npm run dev`**: si abres el `dist/` compilado
sin un servidor que haga de proxy, las llamadas a `/api` fallarán.

## Estructura de carpetas

```
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
