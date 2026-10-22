import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://hipermaxi.with11.dolicloud.com/api/index.php',
    headers: {
        'Content-Type': 'application/json',
        'DOLAPIKEY': 'JesusAPI1234'
    }
});

// interceptor de peticiones HTTP  , para evaluar dinamicamente cada peticion

axiosClient.interceptors.request.use(
    (config) => {
        //extraccion dinamica del to token y almacenado en local
        const token = localStorage.getItem('jwt-token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Retorno explicito de la promesa rechazada para manejar errores de peticion
        return Promise.reject(error);
    }
);


export default axiosClient;