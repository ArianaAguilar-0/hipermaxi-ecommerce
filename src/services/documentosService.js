import dolibarrClient from './dolibarrClient';

// Fotos de productos guardadas en la pestaña "Documentos" de Dolibarr.
// Se piden a través del proxy (key de servicio), nunca con la key en el navegador.

const EXTENSIONES = /\.(jpe?g|png|webp)$/i;
const TIPOS = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

// Caché en memoria mientras dure la sesión: id → Promise y id → resultado ya resuelto
const pendientes = new Map();
const resueltas = new Map();

// Cola simple: como máximo 3 descargas a la vez para no saturar la conexión con Dolibarr
const MAX_SIMULTANEAS = 3;
let activas = 0;
const cola = [];
const siguiente = () => {
  if (activas >= MAX_SIMULTANEAS || !cola.length) return;
  const { tarea, ok, mal } = cola.shift();
  activas++;
  tarea().then(ok, mal).finally(() => {
    activas--;
    siguiente();
  });
};
const enCola = (tarea) => new Promise((ok, mal) => { cola.push({ tarea, ok, mal }); siguiente(); });

// Lista los documentos del producto y descarga el PRIMER archivo de imagen (jpg, jpeg, png o webp)
const descargarFoto = async (productoId) => {
  let documentos;
  try {
    ({ data: documentos } = await dolibarrClient.get('/documents', { params: { modulepart: 'product', id: productoId } }));
  } catch (error) {
    if (error?.response?.status === 404) return null; // el producto no tiene documentos
    throw error;
  }
  const foto = (Array.isArray(documentos) ? documentos : [])
    .find((d) => d.type !== 'dir' && EXTENSIONES.test(d.name || ''));
  if (!foto) return null;

  // original_file = carpeta del producto (su ref) / nombre del archivo
  const { data } = await dolibarrClient.get('/documents/download', {
    params: { modulepart: 'product', original_file: `${foto.level1name}/${foto.relativename || foto.name}` },
  });
  if (!data?.content) return null;
  const extension = foto.name.split('.').pop().toLowerCase();
  const tipo = String(data['content-type'] || '').startsWith('image/') ? data['content-type'] : TIPOS[extension];
  return `data:${tipo};base64,${data.content}`;
};

export const DocumentosService = {
  /** Foto ya descargada en esta sesión (sin esperar): url, null (no tiene) o undefined (no se sabe aún). */
  fotoEnCache: (productoId) => resueltas.get(String(productoId)),

  /** Devuelve la foto del producto como data URL, o null si no tiene o si falla la descarga. */
  getFotoProducto: (productoId) => {
    const id = String(productoId);
    if (!pendientes.has(id)) {
      pendientes.set(id, enCola(() => descargarFoto(id))
        .then((url) => { resueltas.set(id, url); return url; })
        .catch(() => {
          pendientes.delete(id); // si falló la red, se volverá a intentar la próxima vez
          return null;
        }));
    }
    return pendientes.get(id);
  },
};

export default DocumentosService;
