import React, { useRef }  from "react";

export const UncontrolInput = () => { 
  const inputRef = useRef(null); // Referencia al input

  const handleSubmit = (event) => { 
    event.preventDefault(); // Evita el comportamiento por defecto del formulario
    console.log("Valor Capturado del DOM (No Controlado): ", inputRef.current.value); // Accede al valor del input a través de la referencia
  }

  return (

    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center gap-3"> 
      <label htmlFor="campoRef" className="text-sm font-medium text-gray-700" >Código de verificación: (userRef)</label>
      <input type="text" id="campoRef" ref={inputRef} className="border border-gray-300 rounded-md p-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ingrese un código" />

      <button type="submit" className="mt-5 w-full rounded-4xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 hover: cursor-pointer">Procesar imperativamente</button>


    
    </form>

  );

}

export default UncontrolInput;