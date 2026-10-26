import dolibarrClient from './dolibarrClient';

// Nombre del grupo de Dolibarr que da acceso al panel de administración
export const GRUPO_ADMIN = 'Admin e-commerce';

// Cabecera con el token recién obtenido (todavía no está guardado en la sesión)
const conTokenDe = (token) => ({ headers: { DOLAPIKEY: token } });

export const UsuariosService = {
  /** POST /login → token (API key) del usuario de Dolibarr. */
  login: async (login, password) => {
    const { data } = await dolibarrClient.post('/login', { login, password });
    return data?.success?.token;
  },

  /** GET /users/info → datos del usuario dueño del token (admin, socid, nombre…). */
  getInfo: async (token) => {
    const { data } = await dolibarrClient.get('/users/info', conTokenDe(token));
    return data;
  },

  /**
   * GET /users/{id}/groups → grupos de un usuario (el id viene de /users/info).
   * Requiere el permiso "Usuarios → Consultar usuarios, grupos y sus permisos".
   * (GET /users/groups no sirve: responde 403 aun con ese permiso.)
   */
  getGrupos: async (token, usuarioId) => {
    try {
      const { data } = await dolibarrClient.get(`/users/${usuarioId}/groups`, conTokenDe(token));
      return Array.isArray(data) ? data : [];
    } catch (error) {
      // Dolibarr responde 404 si el usuario no pertenece a ningún grupo
      if (error?.response?.status === 404) return [];
      throw error;
    }
  },

  /** Tercero vinculado a un usuario externo (cliente), leído con su propio token. */
  getTerceroDelUsuario: async (token, socid) => {
    const { data } = await dolibarrClient.get(`/thirdparties/${socid}`, conTokenDe(token));
    return data;
  },
};

export default UsuariosService;
