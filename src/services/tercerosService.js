import dolibarrClient from './dolibarrClient';
import { CONFIG_TIENDA } from '@/lib/configTienda';

export const TercerosService = {
  /** Busca un tercero por correo (GET /thirdparties con sqlfilters). Devuelve null si no existe. */
  buscarPorEmail: async (email) => {
    const correo = String(email).trim().toLowerCase().replace(/'/g, "\\'");
    try {
      const { data } = await dolibarrClient.get('/thirdparties', {
        params: { limit: 1, sqlfilters: `(t.email:=:'${correo}')` },
      });
      return Array.isArray(data) && data.length ? data[0] : null;
    } catch (error) {
      // Dolibarr responde 404 cuando no hay resultados
      if (error?.response?.status === 404) return null;
      throw error;
    }
  },

  getTercero: async (id) => {
    const { data } = await dolibarrClient.get(`/thirdparties/${id}`);
    return data;
  },

  /**
   * Crea un cliente (POST /thirdparties).
   * El NIT/CI se guarda en idprof1 ("Id. prof. 1").
   * code_client "-1" = Dolibarr asigna el código automáticamente.
   */
  crearCliente: async ({ nombre, nit, email, telefono, direccion }) => {
    const { data } = await dolibarrClient.post('/thirdparties', {
      name: nombre.trim(),
      client: 1,
      code_client: '-1',
      idprof1: nit.trim(),
      email: email.trim().toLowerCase(),
      phone: telefono.trim(),
      address: direccion.trim(),
      country_id: CONFIG_TIENDA.PAIS_BOLIVIA_ID,
    });
    return data; // ID del nuevo tercero
  },
};

export default TercerosService;
