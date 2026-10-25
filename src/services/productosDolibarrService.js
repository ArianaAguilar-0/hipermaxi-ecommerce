import dolibarrClient from './dolibarrClient';

const toNumber = (v, def = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

// Limpia el texto de búsqueda para usarlo dentro de sqlfilters:
// - quita ( ) que rompen el balance de paréntesis (Dolibarr responde 400)
// - quita " \ < > ; que la protección anti-inyección de Dolibarr bloquea (403)
// - escapa las comillas simples
export const limpiarBusqueda = (texto) =>
  String(texto ?? '')
    .replace(/[()"\\<>;]/g, ' ')
    .trim()
    .slice(0, 60)
    .replace(/'/g, "\\'");

/**
 * Filtro de búsqueda:
 * - cliente o visitante: solo por nombre (t.label)
 * - administrador: por nombre, referencia o código de barras
 */
export const filtroBusqueda = (texto, esAdmin = false) => {
  const s = limpiarBusqueda(texto);
  if (!s) return '';
  if (!esAdmin) return `(t.label:like:'%${s}%')`;
  return `(t.label:like:'%${s}%') or (t.ref:like:'%${s}%') or (t.barcode:like:'%${s}%')`;
};

/** Convierte un producto de Dolibarr al formato que usa la tienda. */
export const normalizarProducto = (p = {}) => ({
  id: String(p.id),
  ref: p.ref ?? '',
  label: p.label ?? '',
  descripcion: p.description ?? '',
  barcode: p.barcode ?? '',
  precio: toNumber(p.price_ttc), // precio con impuestos
  tva_tx: toNumber(p.tva_tx),
  stock: toNumber(p.stock_reel),
});

/**
 * Convierte los datos del formulario al payload que espera Dolibarr:
 * {
 *   ref, label, description,
 *   type: "0" | "1",            // 0 = producto, 1 = servicio
 *   status: "0" | "1",          // en venta
 *   status_buy: "0" | "1",      // en compra
 *   barcode, barcode_type: "1",
 *   price, price_min, price_base_type: "HT" | "TTC",
 *   tva_tx, weight, weight_units: "0"
 * }
 */
export const toDolibarrPayload = (form) => ({
  ref: form.ref?.trim(),
  label: form.label?.trim(),
  description: form.description ?? '',
  type: String(form.type ?? '0'),
  status: form.status ? '1' : '0',
  status_buy: form.status_buy ? '1' : '0',
  barcode: form.barcode?.trim() ?? '',
  barcode_type: String(form.barcode_type ?? '1'),
  price: toNumber(form.price),
  price_min: toNumber(form.price_min),
  price_base_type: form.price_base_type || 'HT',
  tva_tx: toNumber(form.tva_tx),
  weight: toNumber(form.weight),
  weight_units: String(form.weight_units ?? '0'),
});

/** Valores iniciales del formulario (producto nuevo). */
export const productoVacio = {
  ref: '',
  label: '',
  description: '',
  type: '0',
  status: true,
  status_buy: true,
  barcode: '',
  barcode_type: '1',
  price: '',
  price_min: '',
  price_base_type: 'HT',
  tva_tx: '13',
  weight: '',
  weight_units: '0',
};

/** Convierte un producto devuelto por Dolibarr al estado del formulario. */
export const fromDolibarr = (p = {}) => ({
  ref: p.ref ?? '',
  label: p.label ?? '',
  description: p.description ?? '',
  type: String(p.type ?? '0'),
  status: String(p.status) === '1',
  status_buy: String(p.status_buy) === '1',
  barcode: p.barcode ?? '',
  barcode_type: String(p.barcode_type ?? '1'),
  price: p.price != null ? toNumber(p.price).toFixed(2) : '',
  price_min: p.price_min != null ? toNumber(p.price_min).toFixed(2) : '',
  price_base_type: p.price_base_type || 'HT',
  tva_tx: p.tva_tx != null ? String(toNumber(p.tva_tx)) : '13',
  weight: p.weight != null && p.weight !== '' ? String(toNumber(p.weight)) : '',
  weight_units: String(p.weight_units ?? '0'),
});

export const ProductosDolibarrService = {
  /**
   * Lista productos con paginación y búsqueda por ref/etiqueta.
   */
  getProductos: async ({ page = 0, limit = 10, search = '', signal } = {}) => {
    const params = {
      sortfield: 't.rowid',
      sortorder: 'DESC',
      limit,
      page,
    };
    // El panel de administración busca por nombre, referencia o código de barras
    const filtro = filtroBusqueda(search, true);
    if (filtro) params.sqlfilters = filtro;
    try {
      const { data } = await dolibarrClient.get('/products', { params, signal });
      return Array.isArray(data) ? data : data?.data ?? [];
    } catch (error) {
      // Dolibarr responde 404 cuando no hay resultados
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  /**
   * Catálogo de la tienda: solo productos (mode=1) en venta, con stock y paginación.
   * Devuelve { productos, total, paginas }.
   */
  getCatalogo: async ({ page = 0, limit = 12, categoria, texto = '', esAdmin = false, recientes = false, signal } = {}) => {
    const filtros = ['(t.tosell:=:1)'];
    const busqueda = filtroBusqueda(texto, esAdmin);
    if (busqueda) filtros.push(`(${busqueda})`);

    const params = {
      mode: 1,
      limit,
      page,
      // Orden alfabético o, para "destacados", los más recientes primero
      sortfield: recientes ? 't.rowid' : 't.label',
      sortorder: recientes ? 'DESC' : 'ASC',
      includestockdata: 1,
      pagination_data: true,
      sqlfilters: filtros.join(' and '),
    };
    if (categoria) params.category = categoria;

    try {
      const { data } = await dolibarrClient.get('/products', { params, signal });
      const lista = Array.isArray(data) ? data : data?.data ?? [];
      return {
        productos: lista.map(normalizarProducto),
        total: Number(data?.pagination?.total ?? lista.length),
        paginas: Number(data?.pagination?.page_count ?? 1),
      };
    } catch (error) {
      if (error?.response?.status === 404) return { productos: [], total: 0, paginas: 0 };
      throw error;
    }
  },

  /** Detalle de un producto con su stock (GET /products/{id}). */
  getProductoDetalle: async (id, signal) => {
    const { data } = await dolibarrClient.get(`/products/${id}`, {
      params: { includestockdata: 1 },
      signal,
    });
    return { ...normalizarProducto(data), enVenta: String(data?.status) === '1', tipo: String(data?.type) };
  },

  getProductoById: async (id, signal) => {
    const { data } = await dolibarrClient.get(`/products/${id}`, { signal });
    return data;
  },

  /** Crea un producto. Dolibarr devuelve el ID del nuevo registro. */
  createProducto: async (form) => {
    const { data } = await dolibarrClient.post('/products', toDolibarrPayload(form));
    return data;
  },

  updateProducto: async (id, form) => {
    const { data } = await dolibarrClient.put(`/products/${id}`, toDolibarrPayload(form));
    return data;
  },
};

export default ProductosDolibarrService;
