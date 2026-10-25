import { useCallback, useEffect, useState } from 'react';
import ProductosDolibarrService from '../services/productosDolibarrService';
import { getErrorMessage } from '../services/dolibarrClient';

/**
 * Catálogo de productos con "cargar más".
 * Al cambiar la categoría o la búsqueda, la lista vuelve a la primera página.
 */
export const useCatalogo = ({ categoria = null, texto = '', esAdmin = false, recientes = false, limit = 12 } = {}) => {
  const [reloadKey, setReloadKey] = useState(0);
  // Clave de la consulta actual: si cambia, se empieza de cero
  const consulta = JSON.stringify([categoria, texto, esAdmin, recientes, limit, reloadKey]);

  // Página pedida, asociada a la consulta que la pidió
  const [pedido, setPedido] = useState({ consulta, page: 0 });
  const page = pedido.consulta === consulta ? pedido.page : 0;

  // Resultado acumulado de las páginas ya cargadas
  const [datos, setDatos] = useState({ consulta: null, page: -1, items: [], total: 0, paginas: 0, error: '' });

  useEffect(() => {
    const controller = new AbortController();
    ProductosDolibarrService.getCatalogo({
      page, limit, categoria, texto, esAdmin, recientes, signal: controller.signal,
    })
      .then(({ productos, total, paginas }) =>
        setDatos((prev) => ({
          consulta, page, total, paginas, error: '',
          // La página 0 reemplaza la lista; las siguientes se agregan al final
          items: page === 0 || prev.consulta !== consulta ? productos : [...prev.items, ...productos],
        }))
      )
      .catch((err) => {
        if (controller.signal.aborted) return;
        setDatos((prev) => ({
          ...(prev.consulta === consulta ? prev : { items: [], total: 0, paginas: 0 }),
          consulta, page, error: getErrorMessage(err),
        }));
      });
    return () => controller.abort();
  }, [consulta, page, limit, categoria, texto, esAdmin, recientes]);

  const mismaConsulta = datos.consulta === consulta;
  const loading = !mismaConsulta || datos.page !== page;
  const productos = mismaConsulta ? datos.items : [];

  const cargarMas = useCallback(() => setPedido({ consulta, page: page + 1 }), [consulta, page]);
  const recargar = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    productos,
    total: mismaConsulta ? datos.total : 0,
    loading,
    error: !loading ? datos.error : '',
    hayMas: mismaConsulta && !loading && !datos.error && page + 1 < datos.paginas,
    cargarMas,
    recargar,
  };
};

export default useCatalogo;
