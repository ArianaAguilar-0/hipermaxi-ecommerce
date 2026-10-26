import { useCallback, useEffect, useRef, useState } from 'react';
import ProductosDolibarrService from '../services/productosDolibarrService';
import CategoriasService from '../services/categoriasService';
import { getErrorMessage } from '../services/dolibarrClient';

// Error de un paso posterior a la creación (el producto ya existe en Dolibarr)
class ErrorTrasCrear extends Error {}

/**
 * Hook que encapsula el estado y las operaciones CRUD de productos en Dolibarr.
 */
export const useProductosDolibarr = ({ limit = 10, enabled = true } = {}) => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Resultado de la última petición, asociado a la "clave" de consulta que lo produjo
  const [result, setResult] = useState({ key: null, data: [], error: '' });

  const recargar = useCallback(() => setReloadKey((k) => k + 1), []);
  const queryKey = `${page}|${limit}|${search}|${reloadKey}`;

  // READ (listado)
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    ProductosDolibarrService.getProductos({ page, limit, search, signal: controller.signal })
      .then((data) => setResult({ key: queryKey, data, error: '' }))
      .catch((err) => {
        if (!controller.signal.aborted) {
          setResult({ key: queryKey, data: [], error: getErrorMessage(err) });
        }
      });
    return () => controller.abort();
  }, [page, limit, search, enabled, queryKey]);

  const loading = enabled && result.key !== queryKey;
  const productos = result.data;
  const error = result.error;

  // Evita el doble envío: isSubmitting recién cambia en el siguiente render,
  // así que un doble clic alcanzaba a mandar dos POST (el segundo daba "ErrorProductAlreadyExists")
  const enCurso = useRef(false);

  const ejecutar = async (fn) => {
    if (enCurso.current) return { ok: false, error: 'Ya se está guardando, espera un momento.' };
    enCurso.current = true;
    setIsSubmitting(true);
    try {
      const res = await fn();
      return { ok: true, data: res };
    } catch (err) {
      const creado = err instanceof ErrorTrasCrear;
      return { ok: false, creado, status: err?.response?.status, error: creado ? err.message : getErrorMessage(err) };
    } finally {
      enCurso.current = false;
      setIsSubmitting(false);
      recargar();
    }
  };

  // Comprueba que Dolibarr guardó el precio; si no, lo fija con un PUT aparte
  const asegurarPrecio = async (id, form) => {
    const guardado = await ProductosDolibarrService.getProductoById(id);
    const campo = form.price_base_type === 'TTC' ? guardado.price_ttc : guardado.price;
    if (Math.abs(Number(campo) - Number(form.price)) > 0.001) {
      await ProductosDolibarrService.updatePrecio(id, form);
    }
  };

  // Ejecuta los pasos que van después de crear; si uno falla, avisa que el producto YA existe
  const pasoTrasCrear = async (id, form, nombre, fn) => {
    try {
      await fn();
    } catch (err) {
      throw new ErrorTrasCrear(
        `El producto ${form.ref} se creó (ID ${id}), pero falló ${nombre}: ${getErrorMessage(err)}. ` +
        'No lo vuelvas a crear: edítalo para completarlo.'
      );
    }
  };

  // CREATE: crea el producto, verifica el precio y lo asigna a la categoría elegida
  const crearProducto = (form) =>
    ejecutar(async () => {
      const id = await ProductosDolibarrService.createProducto(form);
      await pasoTrasCrear(id, form, 'al guardar el precio', () => asegurarPrecio(id, form));
      if (form.categoria) {
        await pasoTrasCrear(id, form, 'al asignar la categoría', () =>
          CategoriasService.vincularProducto(form.categoria, id));
      }
      return id;
    });

  // UPDATE: actualiza el producto, verifica el precio y, si cambió la categoría, la reemplaza
  const actualizarProducto = (id, form, categoriaAnterior = '', anterior = {}) =>
    ejecutar(async () => {
      const res = await ProductosDolibarrService.updateProducto(id, form, anterior);
      await asegurarPrecio(id, form);
      if (form.categoria !== categoriaAnterior) {
        if (categoriaAnterior) await CategoriasService.desvincularProducto(categoriaAnterior, id);
        if (form.categoria) await CategoriasService.vincularProducto(form.categoria, id);
      }
      return res;
    });

  // DELETE: si Dolibarr lo rechaza, el producto sigue en la lista (se recarga desde Dolibarr)
  const eliminarProducto = (id) => ejecutar(() => ProductosDolibarrService.deleteProducto(id));

  const buscar = (texto) => {
    setPage(0);
    setSearch(texto);
  };

  return {
    productos,
    page,
    setPage,
    search,
    buscar,
    loading,
    isSubmitting,
    error,
    recargar,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    hasNextPage: !loading && productos.length === limit,
  };
};

export default useProductosDolibarr;
