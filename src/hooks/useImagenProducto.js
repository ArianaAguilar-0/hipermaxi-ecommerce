import { useEffect, useRef, useState } from 'react';
import DocumentosService from '../services/documentosService';
import CategoriasService from '../services/categoriasService';
import { cargarCategorias } from './useCategorias';
import { imagenDeCategoria, IMAGEN_GENERICA } from '@/lib/imagenesCategorias';

// Mapa productoId → nombre de su categoría. Se arma UNA vez por sesión (una consulta por categoría)
// y solo cuando algún producto visible no tiene foto.
let mapaCategorias = null;
const cargarMapaCategorias = () => {
  if (!mapaCategorias) {
    mapaCategorias = cargarCategorias()
      .then((categorias) => Promise.all(
        categorias.map((c) => CategoriasService.getIdsProductos(c.id)
          .then((ids) => ids.map((id) => [id, c.label]))
          .catch(() => []))
      ))
      .then((pares) => new Map(pares.flat()))
      .catch(() => {
        mapaCategorias = null; // se reintenta la próxima vez
        return new Map();
      });
  }
  return mapaCategorias;
};

/**
 * Imagen de un producto con carga diferida:
 * - espera a que el elemento esté cerca de la pantalla (IntersectionObserver)
 * - usa la foto de Dolibarr (en caché en memoria) o, si no hay, la ilustración de su categoría
 * Devuelve { ref, src, esFoto, cargando }. La lista de productos nunca espera a las imágenes.
 */
export const useImagenProducto = (productoId) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [resultado, setResultado] = useState({ id: null, src: null, esFoto: false });
  const id = productoId != null ? String(productoId) : null;

  // 1) Detecta cuándo la imagen entra (o está por entrar) en pantalla
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        setVisible(true);
        observador.disconnect();
      }
    }, { rootMargin: '200px' });
    observador.observe(el);
    return () => observador.disconnect();
  }, [visible]);

  // 2) Ya visible: foto de Dolibarr o, si no tiene, ilustración de la categoría
  useEffect(() => {
    if (!visible || !id) return;
    let activo = true;
    DocumentosService.getFotoProducto(id).then(async (foto) => {
      if (foto) {
        if (activo) setResultado({ id, src: foto, esFoto: true });
        return;
      }
      const mapa = await cargarMapaCategorias();
      if (activo) setResultado({ id, src: imagenDeCategoria(mapa.get(id)), esFoto: false });
    });
    return () => { activo = false; };
  }, [visible, id]);

  // Si la foto ya se descargó antes en esta sesión, se muestra al instante
  const enCache = id ? DocumentosService.fotoEnCache(id) : undefined;
  if (enCache) return { ref, src: enCache, esFoto: true, cargando: false };
  if (!id) return { ref, src: IMAGEN_GENERICA, esFoto: false, cargando: false };

  const listo = resultado.id === id;
  return { ref, src: listo ? resultado.src : null, esFoto: listo && resultado.esFoto, cargando: !listo };
};

export default useImagenProducto;
