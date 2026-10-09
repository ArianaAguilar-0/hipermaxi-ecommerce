import react, { useState } from "react";


export const Contador = () => {

  const [cuenta, setCuenta] = useState(0);
  

  const incrementar = () => {
    setCuenta(cuenta + 1);
  };

  return (
    <>
    <div className="p-20 text-center font-semibold text-3xl b-1 border-color:gray-300"> 
      <h1>Contador: {cuenta}</h1>
      <button className="mt-5 w-full rounded-4xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 hover: cursor-pointer" 
      onClick={incrementar}>Incrementar</button>
    </div>
    </>
    
  );


}

export default Contador;