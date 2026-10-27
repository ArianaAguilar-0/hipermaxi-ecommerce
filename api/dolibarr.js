// Función serverless de Vercel: reemplaza al proxy de Vite en producción.
// Recibe /api/index.php/... (vercel.json la enruta aquí) y reenvía la petición a DOLIBARR_URL.
// La key de servicio solo existe en el servidor (variables de entorno de Vercel), nunca en el navegador.

const TIEMPO_MAXIMO_MS = 25000; // espera máxima hacia Dolibarr (la función tiene 30 s en vercel.json)
const LIMITE_POR_MINUTO = 120; // peticiones por IP y por minuto (límite básico, por instancia)

// ---------------------------------------------------------------------------
// Lista blanca: solo los endpoints que usa la app (ver src/services).
// `token: true` = exige el token del usuario (nunca se hace con la key de servicio).
// ---------------------------------------------------------------------------
const N = '\\d+';
const PERMITIDOS = [
  // Estado de la API (diagnóstico)
  { metodo: 'GET', ruta: '^status$' },
  // Login y datos del usuario (con su propio token)
  { metodo: 'POST', ruta: '^login$' },
  { metodo: 'GET', ruta: '^users/info$' },
  { metodo: 'GET', ruta: `^users/${N}/groups$` },
  // Catálogo
  { metodo: 'GET', ruta: '^products$' },
  { metodo: 'GET', ruta: `^products/${N}$` },
  { metodo: 'GET', ruta: `^products/${N}/categories$` },
  { metodo: 'GET', ruta: '^categories$' },
  { metodo: 'GET', ruta: `^categories/${N}/objects$` },
  { metodo: 'GET', ruta: '^warehouses$' },
  { metodo: 'GET', ruta: '^documents$' },
  { metodo: 'GET', ruta: '^documents/download$' },
  // Checkout (con la key de servicio, como en local)
  { metodo: 'GET', ruta: '^thirdparties$' },
  { metodo: 'GET', ruta: `^thirdparties/${N}$` },
  { metodo: 'POST', ruta: '^thirdparties$' },
  { metodo: 'POST', ruta: '^orders$' },
  { metodo: 'GET', ruta: `^orders/${N}$` },
  { metodo: 'POST', ruta: `^orders/${N}/validate$` },
  { metodo: 'POST', ruta: '^shipments$' },
  { metodo: 'GET', ruta: `^shipments/${N}$` },
  { metodo: 'POST', ruta: `^shipments/${N}/validate$` },
  { metodo: 'POST', ruta: `^shipments/${N}/close$` },
  { metodo: 'POST', ruta: `^invoices/createfromorder/${N}$` },
  { metodo: 'GET', ruta: `^invoices/${N}$` },
  { metodo: 'PUT', ruta: `^invoices/${N}$` },
  { metodo: 'POST', ruta: `^invoices/${N}/validate$` },
  { metodo: 'POST', ruta: `^invoices/${N}/payments$` },
  { metodo: 'PUT', ruta: '^documents/builddoc$' },
  // Panel de administrador: SOLO con el token del administrador
  { metodo: 'POST', ruta: '^products$', token: true },
  { metodo: 'PUT', ruta: `^products/${N}$`, token: true },
  { metodo: 'DELETE', ruta: `^products/${N}$`, token: true },
  { metodo: 'POST', ruta: `^categories/${N}/objects/product/${N}$`, token: true },
  { metodo: 'DELETE', ruta: `^categories/${N}/objects/product/${N}$`, token: true },
  { metodo: 'POST', ruta: '^stockmovements$', token: true },
].map((r) => ({ ...r, expresion: new RegExp(r.ruta) }));

// ---------------------------------------------------------------------------
// Límite básico por IP (en memoria: se reinicia cuando Vercel recicla la instancia)
// ---------------------------------------------------------------------------
const contador = new Map();
const superaLimite = (ip) => {
  const ahora = Date.now();
  const registro = contador.get(ip);
  if (!registro || ahora - registro.inicio > 60000) {
    contador.set(ip, { inicio: ahora, total: 1 });
    if (contador.size > 5000) contador.clear(); // evita crecer sin límite
    return false;
  }
  registro.total += 1;
  return registro.total > LIMITE_POR_MINUTO;
};

const responderJson = (res, status, mensaje) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: { code: status, message: mensaje } }));
};

// Lee el cuerpo tal cual llegó (sin parsearlo ni modificarlo)
const leerCuerpo = (req) => new Promise((ok, mal) => {
  const partes = [];
  req.on('data', (c) => partes.push(c));
  req.on('end', () => ok(partes.length ? Buffer.concat(partes) : undefined));
  req.on('error', mal);
});

/**
 * Extrae la ruta de Dolibarr y los parámetros originales.
 * vercel.json reescribe /api/<resto> → /api/dolibarr?ruta=<resto>, conservando la query original.
 */
const separarRuta = (req) => {
  const url = new URL(req.url, 'http://localhost');
  let resto = url.searchParams.get('ruta');
  url.searchParams.delete('ruta');
  if (resto == null) resto = url.pathname.replace(/^\/api\/?/, ''); // por si llega sin reescritura
  resto = resto.replace(/^\/+/, '');
  if (!resto.startsWith('index.php/')) return null;
  return { endpoint: resto.slice('index.php/'.length).replace(/\/+$/, ''), query: url.searchParams.toString() };
};

export default async function handler(req, res) {
  const baseDolibarr = (process.env.DOLIBARR_URL || '').trim().replace(/\/+$/, '').replace(/\/api\/index\.php$/i, '');
  const keyServicio = (process.env.DOLIBARR_API_KEY || '').trim();
  if (!baseDolibarr || !keyServicio) {
    return responderJson(res, 500, 'Faltan DOLIBARR_URL o DOLIBARR_API_KEY en las variables de entorno de Vercel');
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'desconocida').split(',')[0].trim();
  if (superaLimite(ip)) return responderJson(res, 429, 'Demasiadas peticiones: espera un minuto e intenta de nuevo');

  const ruta = separarRuta(req);
  const metodo = String(req.method || 'GET').toUpperCase();
  if (!ruta) return responderJson(res, 403, 'Ruta no permitida');

  const regla = PERMITIDOS.find((r) => r.metodo === metodo && r.expresion.test(ruta.endpoint));
  if (!regla) return responderJson(res, 403, `No permitido: ${metodo} /${ruta.endpoint}`);

  // Token del usuario (si inició sesión). Las escrituras del admin y todo DELETE lo exigen.
  const tokenUsuario = String(req.headers.dolapikey || '').trim();
  if ((regla.token || metodo === 'DELETE') && !tokenUsuario) {
    return responderJson(res, 403, 'Esta acción requiere iniciar sesión como administrador');
  }

  const cuerpo = ['GET', 'HEAD'].includes(metodo) ? undefined : await leerCuerpo(req);
  const destino = `${baseDolibarr}/api/index.php/${ruta.endpoint}${ruta.query ? `?${ruta.query}` : ''}`;

  // Sin reintentos: si falla, el error vuelve a la app tal cual
  const controller = new AbortController();
  const temporizador = setTimeout(() => controller.abort(), TIEMPO_MAXIMO_MS);
  try {
    const respuesta = await fetch(destino, {
      method: metodo,
      headers: {
        Accept: req.headers.accept || 'application/json',
        ...(req.headers['content-type'] ? { 'Content-Type': req.headers['content-type'] } : {}),
        // Key de servicio SOLO si la petición no trae el token del usuario
        DOLAPIKEY: tokenUsuario || keyServicio,
      },
      body: cuerpo,
      signal: controller.signal,
    });
    const datos = Buffer.from(await respuesta.arrayBuffer());
    res.statusCode = respuesta.status;
    const tipo = respuesta.headers.get('content-type');
    if (tipo) res.setHeader('Content-Type', tipo);
    res.setHeader('Cache-Control', 'no-store');
    res.end(datos);
  } catch (error) {
    const agotado = error?.name === 'AbortError';
    responderJson(res, agotado ? 504 : 502, agotado ? 'Dolibarr no respondió a tiempo' : 'No se pudo conectar con Dolibarr');
  } finally {
    clearTimeout(temporizador);
  }
}
