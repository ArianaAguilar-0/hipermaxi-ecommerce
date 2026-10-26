import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { LogIn, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import CampoTexto from "./checkout/CampoTexto";

// Formulario único de login (clientes y administradores) con usuarios de Dolibarr
const LoginForm = () => {
    const { login, loading, isAutenticated } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    const volver = state?.volver;

    // Estado local para los campos del formulario de login
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');

    // Manejador genérico de eventos para los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!credentials.login.trim() || !credentials.password) {
            setErrorMessage('Por favor ingresa tu usuario y contraseña');
            return;
        }

        const result = await login({ login: credentials.login.trim(), password: credentials.password });
        if (!result.success) {
            setErrorMessage(result.message);
            return;
        }
        // Avisos del login (por ejemplo, grupos que no se pudieron leer): se muestran más tiempo
        if (result.aviso) toast.error(result.aviso, { duration: 9000 });
        toast.success('¡Bienvenido!');
        // Vuelve a donde estaba (por ejemplo, el checkout); el admin va a su panel
        navigate(volver || (result.rol === 'admin' ? '/admin/productos' : '/'), { replace: true });
    };

    // Si ya hay sesión, no tiene sentido mostrar el login
    if (isAutenticated && !loading) return <Navigate to={volver || '/'} replace />;

    return (
        <div className="mx-auto my-6 max-w-md rounded-3xl bg-white p-8 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-hiper-orange-light text-hiper-orange">
                <User />
            </div>
            <h1 className="mt-4 text-center !text-2xl font-extrabold text-hiper-navy">Iniciar sesión</h1>
            <p className="mt-1 text-center text-sm text-gray-500">
                {volver === '/checkout' ? 'Inicia sesión para finalizar tu compra.' : 'Ingresa con tu usuario de Hipermaxi.'}
            </p>

            {errorMessage && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <CampoTexto id="login" name="login" label="Usuario" value={credentials.login}
                    onChange={handleInputChange} autoComplete="username" disabled={loading} />
                <CampoTexto id="password" name="password" type="password" label="Contraseña" value={credentials.password}
                    onChange={handleInputChange} autoComplete="current-password" disabled={loading} />

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-hiper-orange py-3 font-bold text-white transition hover:bg-hiper-orange-dark disabled:opacity-60"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                    {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
