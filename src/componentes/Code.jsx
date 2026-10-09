import React, { useState } from 'react'; // Anti-patrón: Mutación directa de la referencia de memoria del estado 
export function Code() { 
  const [tareas, setTareas] = useState(['Revisar Lexico', 'Auditar PRs']); 
  const [texto, setTexto] = useState(''); 
  const agregarTarea = () => {

      if(!texto.trim()) return; // Validación: Evitar agregar tareas vacías o con solo espacios en blanco

     setTareas([...tareas, texto]); // SOLUCIÓN: Crear un nuevo arreglo con el operador spread.
     setTexto('');
     }; 
     return (
          <div >
            <input value={texto} onChange={(e) => setTexto(e.target.value)} />
            <button className='bg-blue-600 text-4xl p-3 hover: bg-blue-400' onClick={agregarTarea}>Agregar</button>
            {/* Renderizado de la lista */}
          <ul>
            {tareas.map((tarea, index) => (
              <li key={index}>{tarea}</li>
            ))}
          </ul>
          </div>      
     );
     
  }
  export default Code;