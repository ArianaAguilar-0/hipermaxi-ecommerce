import React,  { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CardSkeleton from '../Moleculas/CardSkeleton';


export const CatalogProductos = () => {
  
const [productos, setProductos] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchProductos = useCallback( async (signal) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await axios.get('https://fakestoreapi.com/products', {signal});
    setProductos(response.data);
  } catch(err) {
    if(!axios.isCancel(err)) {
      setError(err.message || "Error desconocido al obtener la lista de productos");
    }

  } finally {
    setLoading(false);
  }

}, []);


useEffect( () => {
  const controller = new AbortControler();
  fetchProductos(controller.signal);

  //Limpieza cuando aborta la solicitud http

  return () => {
    controller.abort();
  };
}, [fetchProducts])

const handleRetry = () => {
  const controller = new AbortController();
  fetchProductos(controller.signal);
}

return(

  <div className='conainer mx-auto px-4 py-8' >

    <h1 className="text-2xl font-bold text-gray-800 mb-6" >Catálogo de Productos SIS330</h1>

    {/* 1. ESTADO DE CARGA: Renderizado de matriz de 6 Skeletons en cuadrícula 3 columnas */ } 
    {loading && ( 
      <div  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"> 
      {Array.from({ length: 6 }).map((_, index) => ( 
        <CardSkeleton key={`skeleton-${index}`} />
      ))}
      </div>
     )}
      {/* 2. ESTADO DE ERROR: Despliegue de ErrorMessage con reintento activo */}
      
      {!loading && error && (
        <ErrorMessage errorDetail={error} onRetry={handleRetry} />
      )}

  
  </div>

)

}


export default CatalogProductos;