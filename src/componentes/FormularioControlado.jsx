import react, { useState } from 'react'

export const FormularioControlado = () => {
  const[apellido, setApellido] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Apellido ingresado:", apellido);
  } 

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="apellido">Apellido:</label>
      
      <input type="text" className='b-1 border-color:gray-900 bg-amber-500'  value={ apellido } onChange = {(e)=> setApellido(e.target.value)} />

      <button className="mt-5 w-full rounded-4xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-blue-500 hover: cursor-pointer" type="submit">Enviar</button>
    </form>
  )

}

export default FormularioControlado;