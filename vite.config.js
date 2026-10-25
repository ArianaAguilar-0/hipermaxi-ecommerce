import { fileURLToPath } from "node:url";
import path from "node:path";
import https from "node:https";
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Carga TODAS las variables de .env.local (prefijo '' = también las que no empiezan con VITE_).
  // Estas variables solo existen en Node (servidor de desarrollo), nunca llegan al navegador.
  const env = loadEnv(mode, __dirname, '');

  // URL base de Dolibarr sin "/api/index.php" ni "/" final (si se pegó completa, se recorta)
  const dolibarrUrl = (env.DOLIBARR_URL || '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/index\.php$/i, '');
  const apiKey = (env.DOLIBARR_API_KEY || '').trim();

  if (!dolibarrUrl || !apiKey) {
    console.warn(
      '\n[proxy Dolibarr] Faltan DOLIBARR_URL o DOLIBARR_API_KEY en .env.local. ' +
      'Las llamadas a /api no funcionarán.\n'
    );
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: dolibarrUrl
        ? {
            // /api/index.php/... → {DOLIBARR_URL}/api/index.php/...
            '/api': {
              target: dolibarrUrl,
              changeOrigin: true,
              secure: true,
              // Reutiliza conexiones con Dolibarr (menos conexiones nuevas = menos cortes)
              agent: new https.Agent({ keepAlive: true, maxSockets: 6 }),
              // Si Dolibarr no responde en 30 s, se corta la petición
              proxyTimeout: 30000,
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq, req) => {
                  // Si el usuario inició sesión, el navegador ya envía su propio DOLAPIKEY (token).
                  // Solo si no viene ninguno se agrega la key de servicio.
                  if (!req.headers['dolapikey'] && apiKey) {
                    proxyReq.setHeader('DOLAPIKEY', apiKey);
                  }

                  // Si la conexión con el servidor no se establece en 6 s, se corta
                  // (algunas conexiones se pierden en la red y tardarían ~21 s en fallar)
                  const limitarConexion = (socket) => {
                    if (!socket.connecting) return;
                    const timer = setTimeout(
                      () => socket.destroy(new Error('Tiempo de conexión agotado con Dolibarr')),
                      6000
                    );
                    socket.once('connect', () => clearTimeout(timer));
                    socket.once('close', () => clearTimeout(timer));
                  };
                  // El socket puede estar ya asignado o llegar después
                  if (proxyReq.socket) limitarConexion(proxyReq.socket);
                  else proxyReq.once('socket', limitarConexion);
                });
              },
            },
          }
        : undefined,
    },
  };
})
