import dolibarrClient from './dolibarrClient';

export const CategoriasService = {
  /**
   * Categorías de productos (GET /categories?type=product).
   * Se devuelven solo las "hojas": una categoría que agrupa a otras
   * (por ejemplo "Productos de punto de venta (POS)") no se muestra en el menú.
   */
  getCategoriasProducto: async (signal) => {
    try {
      const { data } = await dolibarrClient.get('/categories', {
        params: { type: 'product', sortfield: 't.label', sortorder: 'ASC', limit: 100 },
        signal,
      });
      const lista = Array.isArray(data) ? data : [];
      const padres = new Set(lista.map((c) => String(c.fk_parent)));
      return lista
        .filter((c) => !padres.has(String(c.id)))
        .map((c) => ({ id: String(c.id), label: c.label }));
    } catch (error) {
      // Dolibarr responde 404 cuando no hay categorías
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  /** Asigna un producto a una categoría (con el token del admin). */
  vincularProducto: async (categoriaId, productoId) => {
    // Cuerpo {} (no null): axios enviaría el texto "null" y Dolibarr responde "Error parsing JSON"
    const { data } = await dolibarrClient.post(`/categories/${categoriaId}/objects/product/${productoId}`, {}, { conToken: true });
    return data;
  },

  /** Quita un producto de una categoría (con el token del admin). */
  desvincularProducto: async (categoriaId, productoId) => {
    const { data } = await dolibarrClient.delete(`/categories/${categoriaId}/objects/product/${productoId}`, { conToken: true });
    return data;
  },
};

export default CategoriasService;
