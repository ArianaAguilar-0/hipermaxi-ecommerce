import axios from 'axios';

// Cliente HTTP único para la API REST de Dolibarr.
// Las peticiones van al proxy de Vite (/api), que agrega la key de servicio.
// La key NUNCA está en el navegador: solo se envía el token del usuario si inició sesión.

// Clave de sessionStorage donde AuthContext guarda la sesión
export const SESSION_KEY = 'hiper_sesion';

// Lee el token del usuario logueado (si existe)
export const getTokenUsuario = () => {
  try {
    const sesion = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    return sesion?.token || null;
  } catch {
    return null;
  }
};

const dolibarrClient = axios.create({
  baseURL: '/api/index.php',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Si hay sesión, se envía el token del usuario; si no, el proxy pone la key de servicio
dolibarrClient.interceptors.request.use((config) => {
  const token = getTokenUsuario();
  if (token) config.headers.DOLAPIKEY = token;
  return config;
});

// Reintentos cuando la conexión con Dolibarr falla:
// - GET (no modifica datos): ante cualquier fallo de red
// - POST/PUT: solo si el proxy confirma que la petición NO llegó a Dolibarr (x-reintentable)
const MAX_REINTENTOS = 3;
dolibarrClient.interceptors.response.use(undefined, async (error) => {
  const config = error?.config;
  const status = error?.response?.status;
  const noLlego = status === 503 && error?.response?.headers?.['x-reintentable'] === '1';
  const falloDeRed = !error?.response || status === 502 || status === 504 || noLlego;
  const reintentable = config?.method === 'get' ? falloDeRed : noLlego;
  if (!config || !reintentable || axios.isCancel(error) || config.signal?.aborted) {
    return Promise.reject(error);
  }
  config.__reintentos = (config.__reintentos || 0) + 1;
  if (config.__reintentos > MAX_REINTENTOS) return Promise.reject(error);
  await new Promise((r) => setTimeout(r, 400 * config.__reintentos));
  return dolibarrClient(config);
});

// Normaliza los mensajes de error que devuelve Dolibarr
export const getErrorMessage = (error) => {
  if (axios.isCancel(error)) return 'Petición cancelada';
  const status = error?.response?.status;
  const data = error?.response?.data;
  const detalle = data?.error?.message || data?.message;

  if (status === 401) {
    return `No autorizado (401): la key o el token no son válidos o expiraron.${detalle ? ` ${detalle}` : ''}`;
  }
  if (status === 403) {
    return `Acceso denegado (403): el usuario de Dolibarr no tiene permiso para esta acción.${detalle ? ` ${detalle}` : ''}`;
  }
  if (!error?.response || status === 502 || status === 503 || status === 504) {
    return 'No se pudo conectar con Dolibarr. Revisa .env.local y reinicia "npm run dev".';
  }
  return detalle || error?.message || 'Error desconocido al comunicarse con Dolibarr';
};

export default dolibarrClient;
