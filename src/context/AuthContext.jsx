import { createContext, useContext, useState } from 'react';
import dolibarrClient, { SESSION_KEY, getErrorMessage } from '@/services/dolibarrClient';

const AuthContext = createContext(null);

// Lee la sesión guardada en sessionStorage (se pierde al cerrar la pestaña)
const leerSesion = () => {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [sesion, setSesion] = useState(leerSesion);
    const [loading, setLoading] = useState(false);

    const logout = () => {
        setSesion(null);
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch {
            // sessionStorage no disponible: no hay nada que limpiar
        }
    };

    // Login con usuario de Dolibarr (los roles se completan en la Fase 3)
    const login = async (credentials) => {
        setLoading(true);
        try {
            // Dolibarr responde: { success: { code, token, entity, message } }
            const response = await dolibarrClient.post('/login', credentials);
            const token = response.data?.success?.token;
            if (!token) throw new Error('El servidor no devolvió un token');

            const nueva = { token, user: { login: credentials.login } };
            try {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(nueva));
            } catch {
                // Si no se puede guardar, la sesión dura solo hasta recargar
            }
            setSesion(nueva);
            return { success: true };
        } catch (error) {
            return { success: false, message: getErrorMessage(error) };
        } finally {
            setLoading(false);
        }
    };

    const contextValue = {
        user: sesion?.user ?? null,
        token: sesion?.token ?? null,
        loading,
        isAutenticated: !!sesion?.token,
        // El rol real se obtiene en la Fase 3 (GET /users/info)
        esAdmin: sesion?.user?.rol === 'admin',
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
