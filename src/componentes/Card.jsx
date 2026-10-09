import React from 'react';
 
export const Card = () => { 
  let productName = "Nike Air Zoom Pegasus"
  let productPrice = "$129.99"
  let productDescription = "Este es un producto de ejemplo";
  return (
    <>
      <div className='max-w-sm rounded-2xl bg-white shadow-lg shadow-gray-200/50 m-10 border-2 border-gray-100 p-5' > {/* contenedor carta de producto */}
          <div className="relative  overflow-hidden aspect-auto bg-gray-100 rounded-2xl">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
            alt="Zapatilla deportiva"
            clasName="h-full w-full object-cover "
            ></img>
          </div> {/* imagen de la carta */}
          <h2 className="py-5">
            <span className="text-2xl font-medium text-gray-900 font-semibold">{productName}</span>
            </h2>
          <h3 className="mt-1 text-3xl font-bold text-gray-900 line-clamp-1" >{productPrice}</h3>
          <p className='mt-2 text-sm text-gray-500 line-camp-2'>{productDescription}</p>

          <button className="mt-5 w-full rounded-4xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 hover: cursor-pointer" >Añadir al Carrito</button>

      </div>
    </>
  )


}

export default Card;