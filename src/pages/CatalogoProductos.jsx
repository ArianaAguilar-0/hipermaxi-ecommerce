import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CardSkeleton from '../Moleculas/CardSkeleton';
import ErrorMessage from '@/shimer/pulse/ErrorMessage';
import EmptyState from '@/shimer/pulse/EmptyState';

export const CatalogProductos = () => {

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductos = useCallback(async (signal) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://fakestoreapi.com/products', { signal });
      setProductos(response.data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        setError(err.message || "Error desconocido al obtener la lista de productos");
      }

    } finally {
      setLoading(false);
    }

  }, []);


  useEffect(() => {
    const controller = new AbortController();
    fetchProductos(controller.signal);

    //Limpieza cuando aborta la solicitud http

    return () => {
      controller.abort();
    };
  }, [fetchProductos])

  const handleRetry = () => {
    const controller = new AbortController();
    fetchProductos(controller.signal);
  }

  return (

    <div className='container mx-auto px-4 py-8' >

      <h1 className="text-2xl font-bold text-gray-800 mb-6" >Catálogo de Productos SIS330</h1>

      {/* 1. ESTADO DE CARGA: Renderizado de matriz de 6 Skeletons en cuadrícula 3 columnas */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}
      {/* 2. ESTADO DE ERROR: Despliegue de ErrorMessage con reintento activo */}

      {!loading && error && (
        <ErrorMessage errorDetail={error} onRetry={handleRetry} />
      )}

      { /*  3. ESTADO VACIO: Renderizado de Empty State SI en array retornado esta cacio */}

      {!loading && !error && productos.length === 0 && (
        <EmptyState message="No hay productos disponibles actualmente." onAction={handleRetry} />
      )}

      {/* 4. ESTADO DE EXITO: REnderizado dinamico con interaccion .map() e injeccion de key  */}

      {!loading && !error && productos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" >
          {productos.map((producto) => (
            <div key={producto.id} className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow' >
              <div>
                <img src={producto.image} alt={producto.title} className='w-full h-48 object-contain rounded-md mb-4 ' />
                <h2 className='text-base font-semibold text-gray-800 line-clamp-1' >{producto.title}</h2>
                <p className='text-sm text-gray-500 mt-1 line-clamp-2' >{producto.description}</p>

              </div>
              <div className='mt-4 flex items-center justify-between' >
                <span className='text-lg font-bold text-blue-600' >
                  ${producto.price.toFixed(2)}
                </span>
                <button className='px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors' > Ver detalle </button>

              </div>
            </div>
          ))}
        </div>

      )}

    </div>

  )

}


export default CatalogProductos;