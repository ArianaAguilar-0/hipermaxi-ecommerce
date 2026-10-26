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
  precioSinImpuesto: toNumber(p.price), // base para las líneas del pedido
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
 *   price, price_base_type: "HT" | "TTC", price_ttc (si la base es TTC), tva_tx,
 *   price_min, weight, barcode, barcode_type: solo si tienen valor
 * }
 */
export const toDolibarrPayload = (form, { esEdicion = false, teniaCodigoBarras = false } = {}) => {
  const base = form.price_base_type === 'TTC' ? 'TTC' : 'HT';
  const precio = toNumber(form.price);
  const payload = {
    ref: form.ref?.trim(),
    label: form.label?.trim(),
    description: form.description ?? '',
    type: Number(form.type ?? 0),
    status: form.status ? 1 : 0,
    status_buy: form.status_buy ? 1 : 0,
    price: precio,
    price_base_type: base,
    tva_tx: toNumber(form.tva_tx),
  };
  // Al CREAR con base TTC, Dolibarr toma el precio de price_ttc (si solo va "price", guarda 0)
  if (base === 'TTC') payload.price_ttc = precio;

  // Campos opcionales: solo se envían si tienen valor
  if (String(form.price_min ?? '').trim() !== '') {
    payload.price_min = toNumber(form.price_min);
    if (base === 'TTC') payload.price_min_ttc = payload.price_min;
  }
  if (String(form.weight ?? '').trim() !== '') {
    payload.weight = toNumber(form.weight);
    payload.weight_units = Number(form.weight_units ?? 0);
  }
  const codigo = form.barcode?.trim();
  if (codigo) {
    payload.barcode = codigo;
    if (form.barcode_type) payload.barcode_type = Number(form.barcode_type);
  } else if (esEdicion && teniaCodigoBarras) {
    // Al editar, si se borró el código de barras, también se quita su tipo
    payload.barcode = '';
    payload.barcode_type = null;
  }
  return payload;
};

/** Valores iniciales del formulario (producto nuevo). */
export const productoVacio = {
  ref: '',
  label: '',
  description: '',
  type: '0',
  status: true,
  status_buy: true,
  barcode: '',
  barcode_type: '',
  price: '',
  price_min: '',
  price_base_type: 'TTC', // precio de góndola (con IVA), como el resto del catálogo
  tva_tx: '13',
  weight: '',
  weight_units: '0',
  categoria: '',
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
  // Sin código de barras no se muestra ningún tipo
  barcode_type: p.barcode ? String(p.barcode_type ?? '') : '',
  // El precio se muestra en la misma base en que está guardado (con o sin IVA)
  price: (p.price_base_type === 'TTC' ? p.price_ttc : p.price) != null
    ? toNumber(p.price_base_type === 'TTC' ? p.price_ttc : p.price).toFixed(2) : '',
  price_min: (p.price_base_type === 'TTC' ? p.price_min_ttc : p.price_min) != null
    ? toNumber(p.price_base_type === 'TTC' ? p.price_min_ttc : p.price_min).toFixed(2) : '',
  price_base_type: p.price_base_type || 'HT',
  tva_tx: p.tva_tx != null ? String(toNumber(p.tva_tx)) : '13',
  weight: p.weight != null && p.weight !== '' ? String(toNumber(p.weight)) : '',
  weight_units: String(p.weight_units ?? '0'),
});

export const ProductosDolibarrService = {
  /**
   * Panel de administración (todas estas llamadas usan el token del administrador).
   * Lista productos con paginación y búsqueda por nombre, referencia o código de barras.
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
      const { data } = await dolibarrClient.get('/products', { params, signal, conToken: true });
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
    // Stock por almacén: { idAlmacen: cantidad } (para armar la expedición)
    const stockPorAlmacen = Object.fromEntries(
      Object.entries(data?.stock_warehouse || {}).map(([alm, s]) => [alm, toNumber(s?.real)])
    );
    return { ...normalizarProducto(data), enVenta: String(data?.status) === '1', tipo: String(data?.type), stockPorAlmacen };
  },

  getProductoById: async (id, signal) => {
    const { data } = await dolibarrClient.get(`/products/${id}`, { signal, conToken: true, params: { includestockdata: 1 } });
    return data;
  },

  /** Categorías asignadas a un producto (GET /products/{id}/categories). */
  getCategoriasDeProducto: async (id) => {
    try {
      const { data } = await dolibarrClient.get(`/products/${id}/categories`, { conToken: true });
      return (Array.isArray(data) ? data : []).map((c) => String(c.id));
    } catch (error) {
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  /** Crea un producto con el token del admin. Dolibarr devuelve el ID del nuevo registro. */
  createProducto: async (form) => {
    const { data } = await dolibarrClient.post('/products', toDolibarrPayload(form), { conToken: true });
    return data;
  },

  /**
   * Actualiza un producto con el token del admin.
   * `anterior` es el producto tal como estaba (para saber si hay que borrar el tipo de código de barras).
   */
  updateProducto: async (id, form, anterior = {}) => {
    const payload = toDolibarrPayload(form, {
      esEdicion: true,
      teniaCodigoBarras: Boolean(anterior.barcode || anterior.barcode_type),
    });
    const { data } = await dolibarrClient.put(`/products/${id}`, payload, { conToken: true });
    return data;
  },

  /** Fija el precio de venta (PUT /products/{id} solo con precio, base e IVA). */
  updatePrecio: async (id, form) => {
    const { data } = await dolibarrClient.put(`/products/${id}`, {
      price: toNumber(form.price),
      price_base_type: form.price_base_type === 'TTC' ? 'TTC' : 'HT',
      tva_tx: toNumber(form.tva_tx),
    }, { conToken: true });
    return data;
  },
};

export default ProductosDolibarrService;
