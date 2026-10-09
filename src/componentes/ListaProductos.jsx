import react, { useState } from 'react'

export const ListaProductos = () => {

  const productosBase = [
    {id: 1, nombre: "Nike Air Zoom Pegasus", precio: "$129.99", descripcion: "Este es un producto de ejemplo"},
    {id: 2, nombre: "Adidas Ultraboost", precio: "$179.99", descripcion: "Este es otro producto de ejemplo"},
    {id: 3, nombre: "Puma RS-X", precio: "$109.99", descripcion: "Este es un tercer producto de ejemplo"}
  ];

  const [filtro, setFiltro] = useState("");
  const [verMas, setVerMas] = useState(false);

  const filtrados = productosBase.filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div className="p-20">
      <input
        type="text"
        placeholder="Buscar producto..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />
      <button onClick={() => setVerMas(!verMas)} className='bg-blue-800 px-3 py-2 text-white hover:bg-blue-400' > { verMas ? "Ocultar Detalles" : "Ver Detalles" } </button>
      
      <ul>
        {filtrados.map((producto) => (
          <li key={producto.id}>
            <h3 className='font-semibold text-amber-700' >{producto.nombre}</h3>
            <p>{producto.precio}</p>
            {verMas && <p>{producto.descripcion}</p>}
          </li>
        ))}
      </ul>
    </div>
  );

}

export default ListaProductos;