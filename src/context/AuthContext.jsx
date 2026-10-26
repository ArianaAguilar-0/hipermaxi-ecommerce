import { createContext, useContext, useState } from 'react';
import { SESSION_KEY, getErrorMessage } from '@/services/dolibarrClient';
import UsuariosService, { GRUPO_ADMIN } from '@/services/usuariosService';

const AuthContext = createContext(null);

// Lee la sesión guardada en sessionStorage (se pierde al cerrar la pestaña)
const leerSesion = () => {
    try {
        const sesion = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        return sesion?.token ? sesion : null;
    } catch {
        return null;
    }
};

const guardarSesion = (sesion) => {
    try {
        if (sesion) sessionStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
        else sessionStorage.removeItem(SESSION_KEY);
    } catch {
        // Sin sessionStorage: la sesión dura hasta recargar
    }
};

const textoPlano = (v) => (v == null ? '' : String(v));

/**
 * Rol del usuario. Devuelve { rol, aviso }:
 * - admin:   admin = 1 en Dolibarr o miembro del grupo "Admin e-commerce"
 * - cliente: usuario externo vinculado a un tercero (socid); no se consultan grupos
 * - interno: cualquier otro usuario interno
 */
const obtenerRol = async (token, info) => {
    if (Number(info.admin) === 1) return { rol: 'admin', aviso: '' };
    if (Number(info.socid) > 0) return { rol: 'cliente', aviso: '' };
    try {
        const grupos = await UsuariosService.getGrupos(token, info.id);
        const enGrupo = grupos.some(
            (g) => textoPlano(g.name ?? g.nom).trim().toLowerCase() === GRUPO_ADMIN.toLowerCase()
        );
        return { rol: enGrupo ? 'admin' : 'interno', aviso: '' };
    } catch (error) {
        // No se ocultan los errores: el usuario entra sin rol de admin y se le explica por qué
        const motivo = error?.response?.status === 403
            ? 'falta el permiso "Usuarios → Consultar usuarios, grupos y sus permisos"'
            : getErrorMessage(error);
        return {
            rol: 'interno',
            aviso: `No se pudieron leer tus grupos de Dolibarr (${motivo}). Entraste sin acceso al panel de administración.`,
        };
    }
};

// Mensajes claros para los errores del login
const mensajeLogin = (error, etapa) => {
    const status = error?.response?.status;
    if (etapa === 'login' && (status === 401 || status === 403)) return 'Usuario o contraseña incorrectos.';
    if (etapa === 'login' && status === 404) return 'El endpoint /login de Dolibarr no está disponible (módulo API REST).';
    if (etapa === 'info' && status === 403) {
        return 'Tu usuario no tiene permiso para consultar su propia información en Dolibarr (GET /users/info).';
    }
    return getErrorMessage(error);
};

export const AuthProvider = ({ children }) => {
    const [sesion, setSesion] = useState(leerSesion);
    const [loading, setLoading] = useState(false);

    const logout = () => {
        setSesion(null);
        guardarSesion(null);
    };

    // Login con usuario de Dolibarr: token → /users/info → rol → tercero (si es cliente)
    const login = async ({ login: usuario, password }) => {
        setLoading(true);
        let etapa = 'login';
        try {
            const token = await UsuariosService.login(usuario, password);
            if (!token) throw new Error('El servidor no devolvió un token');

            etapa = 'info';
            const info = await UsuariosService.getInfo(token);
            const { rol, aviso: avisoRol } = await obtenerRol(token, info);
            const socid = Number(info.socid) > 0 ? Number(info.socid) : null;

            // Datos del tercero del cliente para autocompletar el checkout
            let cliente = null;
            let aviso = avisoRol;
            if (socid) {
                try {
                    const t = await UsuariosService.getTerceroDelUsuario(token, socid);
                    cliente = {
                        nombre: textoPlano(t.name),
                        nit: textoPlano(t.idprof1),
                        email: textoPlano(t.email || info.email),
                        telefono: textoPlano(t.phone),
                        direccion: textoPlano(t.address),
                    };
                } catch (err) {
                    aviso = `No se pudieron leer los datos de tu cuenta de cliente: ${getErrorMessage(err)}`;
                }
            }

            const nombre = [info.firstname, info.lastname].filter(Boolean).join(' ') || info.login;
            const nueva = {
                token,
                user: { id: Number(info.id), login: info.login, nombre, email: info.email || '', rol, socid },
                cliente,
            };
            guardarSesion(nueva);
            setSesion(nueva);
            return { success: true, rol, aviso };
        } catch (error) {
            return { success: false, message: mensajeLogin(error, etapa) };
        } finally {
            setLoading(false);
        }
    };

    const rol = sesion?.user?.rol ?? null;
    const contextValue = {
        user: sesion?.user ?? null,
        token: sesion?.token ?? null,
        cliente: sesion?.cliente ?? null,
        rol,
        loading,
        isAutenticated: !!sesion?.token,
        esAdmin: rol === 'admin',
        esCliente: rol === 'cliente',
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
