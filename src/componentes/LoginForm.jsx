import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const LoginForm = () => {
    const { login, loading } = useAuth();

    // Estado local para los campos del formulario de login
    const [credentials, setCredentials] = useState({
        login: '',
        password: ''
    });

    const [errorMessage, setErrorMessage] = useState('');
    //Manejador generico de eventos par alos imputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({
            ...prev,
            [name]: value
        }));

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!credentials.login || !credentials.password) {
            setErrorMessage('Por favor ingresa tus credenciales');
            return;
        }

        const result = await login(credentials);
        if (!result.success) {
            setErrorMessage(result.message);
        }


    };

    return (
        <div className="max-w-[400px] my-10 mx-auto p-3 border borde-gray-300 rounded-lg shadow-lg ">

            <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

            {errorMessage && (
                <div className="p-3 text-red-500 bg-red-50 border border-red-200 rounded-lg mb-4">
                    {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Usuario */}
                <div className="mb-4">
                    <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                    <input
                        type="text"
                        id="login"
                        name="login"
                        value={credentials.login}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
                </button>
            </form>

        </div>
    );

}

export default LoginForm;
