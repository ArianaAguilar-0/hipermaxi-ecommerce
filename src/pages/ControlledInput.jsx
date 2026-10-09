import React, { useState } from 'react';

export const ControlledInput = () => {

  const [valor, setValor] = useState('');
  
  const handleChange = (event) => {
    setValor(event.target.value);
  };

  return (
    <div className="p-20 text-center font-semibold text-3xl b-1 border-color:gray-300">
      <label htmlFor="campoNombre" className='text-sm font-medium text-gray-700' >Nombre de usuario (useState):</label>

      <input
        type="text"
        id="campoNombre"
        value={valor}
        onChange={handleChange}
        className="border border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Ingrese su nombre"
      />
      <p className='mt-3 text-sm text-gray-600'>Valor actual sincronizado (2 way data binding): {valor}</p> 

    </div>
  );

}

export default ControlledInput;