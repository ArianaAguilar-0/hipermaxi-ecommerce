import React, {useState, useEffect} from "react";

export const ContadorPersistente = () => {
  // Inicializamos  montaje perezoso
  const [ contador, setContador ] = useState(()=> {
    try {
      const valorGuardado = localStorage.getItem('app_contador_valor');
      return valorGuardado !== null ? parseInt(valorGuardado, 10) : 0 ;
    } catch (error) {
      console.warn("No se pudo acceder al localStorage durante la inicialización:", error);
      return 0;
    }
  });

  // Efecto secundario: sicronizar  'contador' en el localStorage en cada actualización
  useEffect(()=> {
    try {
      localStorage.setItem('app_contador_valor', contador.toString());
    } catch(error) {
      console.error('Error al guardar el estado en el locaStorage', error);
    }
  }, [contador] ); // Re-ejecucion reactiva 

  return (

    <div className="p-4 border rounded shadow-sm bg-white max-w-md my-4" >
      <h3 className="text-lg font-bold mb-2 text-slate-800">
        Contador Persistente Defensivo
      </h3>
      <p className="mb-4 text-slate-600" >Valor almacenado: <span className="font-mono font-bold text-blue-700" >{contador}</span></p>

    <button 
      onClick={()=> setContador(prev => prev + 1)}
      className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded hover:bg-slate-700 transition-colors"
    >
      Incrementar
    </button>
        <button 
      onClick={()=> setContador(prev => prev - 1)}
      className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded hover:bg-slate-700 transition-colors"
    >
      Decrementar
    </button>

        <button 
      onClick={()=> setContador(0)}
      className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded hover:bg-slate-700 transition-colors"
    >
      Restablecer
    </button>
    </div>

  );

}

export default ContadorPersistente;