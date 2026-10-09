import React from "react";
import { Link } from "react-router-dom";

const PRODUCTS_DATA = [
  {id: '101', name: 'Servidor Rack IBM', categoria: 'Hardware', price: 1200 },
  {id: '102', name: 'Laptop Dell XPS 13', categoria: 'Hardware', price: 1500 },
  {id: '103', name: 'Monitor LG UltraWide', categoria: 'Hardware', price: 400 },
  {id: '104', name: 'Teclado Mecánico Corsair', categoria: 'Hardware', price: 100 },
  {id: '105', name: 'Mouse Logitech MX Master 3', categoria: 'Hardware', price: 80 },
  {id: '106', name: 'Auriculares Sony WH-1000XM4', categoria: 'Hardware', price: 350 },
];

const Productos = () => { 

  return (
    <div  className="mx-auto max-w-6xl px-6 py-10">  
      <h2 className="text-3xl font-bold mb-2 text-gray-900">Catálogo de Productos</h2>
      <p className="text-gray-600 mb-8">Seleccione un elemento para probar la navegación</p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" >
        {PRODUCTS_DATA.map((product) => (
         <article key={product.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
            <p className="text-gray-600">Categoría: {product.categoria}</p>
            <p className="text-gray-600">Precio: ${product.price}</p>
            <Link to={`/producto/${product.id}`} className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Ver Detalles
            </Link>
          </article> 
        ))}
      </div>
    </div>
  );

}

export default Productos;
