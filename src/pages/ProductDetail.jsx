import React from "react";

import { useParams, useNavigate, Link } from "react-router-dom";

const PRODUCTS_DATA = [
  {id: '101', name: 'Servidor Rack IBM', categoria: 'Hardware', price: 1200 },
  {id: '102', name: 'Laptop Dell XPS 13', categoria: 'Hardware', price: 1500 },
  {id: '103', name: 'Monitor LG UltraWide', categoria: 'Hardware', price: 400 },
  {id: '104', name: 'Teclado Mecánico Corsair', categoria: 'Hardware', price: 100 },
  {id: '105', name: 'Mouse Logitech MX Master 3', categoria: 'Hardware', price: 80 },
  {id: '106', name: 'Auriculares Sony WH-1000XM4', categoria: 'Hardware', price: 350 },
];

const ProductDetail = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  // Busqueda de producto por ID en el arreglo de datos (Array.prototype.find)
  const product = PRODUCTS_DATA.find((item) => item.id === id);

  const handleBack = () => { 
    navigate('/productos');
  }

  const handleSimulatePurchase = () => {
    alert(`Compra simulada correcta del producto: ${product?.name}`);
    navigate('/');
  }

  if (!product) {
    return (
      <div className="px-3 py-1 text-center">
        <h2 className='text-2xl, text-blue-800'> Producto no encontrado  </h2>
        <p className='text-5xl  mx-1 my-0 text-blue-600'>El producto con ID {id} no existe en el catálogo.</p>
        <button className="mt-5 w-full rounded-4xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 hover: cursor-pointer" onClick={handleBack}>Volver al Catálogo</button>  
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-3xl font-bold mb-2 text-gray-900">Detalle del Producto</h2>
      <p className="text-gray-600 mb-8">Información detallada del producto seleccionado</p>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
        <p className="text-gray-600">Categoría: {product.categoria}</p>
        <p className="text-gray-600">Precio: ${product.price}</p>
        <button className="mt-5 w-full rounded-4xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 hover: cursor-pointer" onClick={handleSimulatePurchase}>Simular Compra</button>
        <button className="mt-5 w-full rounded-4xl bg-gray-600 py-3 text-sm font-semibold text-white hover:bg-gray-500 hover: cursor-pointer" onClick={handleBack}>Volver al Catálogo</button>
      </div>
    </div>
  );



}

export default ProductDetail;