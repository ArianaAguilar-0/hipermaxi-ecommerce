import dolibarrClient from './dolibarrClient';

export const AlmacenesService = {
  /** Almacenes activos de Dolibarr, usados como sucursales para "Recoger en tienda". */
  getSucursales: async (signal) => {
    const { data } = await dolibarrClient.get('/warehouses', {
      params: { sortfield: 't.rowid', sortorder: 'ASC', limit: 50 },
      signal,
    });
    return (Array.isArray(data) ? data : [])
      .filter((a) => String(a.statut ?? a.status) === '1')
      .map((a) => ({ id: String(a.id), nombre: a.lieu || a.label || a.ref, ref: a.ref }));
  },
};

export default AlmacenesService;
