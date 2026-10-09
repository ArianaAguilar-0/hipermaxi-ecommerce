import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
  
  return (
    <div className="px-3 py-1 text-center">
        <h2 className='text-2xl, text-blue-800'> 404 - Página no encontrada  </h2>
        <p className='text-5xl  mx-1 my-0 text-blue-600'>El recurso URL a la que intentas acceder no existe en esta aplicación.</p>
        <button className="mt-5 w-full rounded-4xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 hover: cursor-pointer" onClick={() => navigate('/')}>Volver al Inicio</button>  
    </div>
  )

}

export default NotFound;