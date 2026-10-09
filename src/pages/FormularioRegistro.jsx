import React,  {useState} from 'react';

export const FormularioRegistro = () => {
  // creamos un estado unificado para todos los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    categoria: '',
    descripcion: '',
  });

  //2. Estado para la gestion de errores del campo
  const [errors, setErrors] = useState({});

  //3. Estado de Notificación y feedback de envio
  const [isSubmitted, setIsSubmitted] = useState(false);

  // expresiones regulares estandart para la validacion de un email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Manejador generico con sintaxis de Propiedades Computadas ES6 [name]: value
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Actualización inmutable del objeto estado
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Limpieza dinamica del error asociado al campo 
    if(errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: null,
      }));
    }
};
    // Validación de campos en tiempo real
    const validateForm = () => {
      const newErrors = {};
      if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre es obligatorio';
      } else if(formData.nombre.trim().length < 3) {
        newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'El email es obligatorio';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El email no es válido';
      }

      if (!formData.categoria) {
        newErrors.categoria = 'Debe seleccionar una categoría';
      }

      if (!formData.descripcion.trim()) {
        newErrors.descripcion = 'La descripción es obligatoria';
      } else if(formData.descripcion.trim().length < 10) {
        newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
      }

      return newErrors;
    }

  

  

  // Controlador de Envio

    const handleSubmit = (event) => {
      event.preventDefault();
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitted(false);
        return;
      } 

      setErrors({});
      setIsSubmitted(true);
      console.log('Datos del formulario enviados: (payload)', formData);

    }

  const hasActiveErrors = Object.keys(errors).some((key) => errors[key] !== null);
  const isFormIncomplete = !formData.nombre || !formData.email || !formData.categoria || !formData.descripcion; 
  const isButtonDisabled = hasActiveErrors || isFormIncomplete;


  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white border border-gray-200 reunded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 bg-white border-b pb-2">Formulario de Registro</h2>
      {isSubmitted && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 border border-green-200 rounded">
          ¡Formulario enviado correctamente!
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingrese su nombre"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.nombre ? 'border-red-500' : ''}`}
          />
          {errors.nombre && <p className="mt-1 text-sx text-red-600 font-medium" role="alert">{errors.nombre}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ejemplo@dominio.com"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="mt-1 text-sx text-red-600 font-medium" role="alert">{errors.email}</p>}  
          </div>  

        <div className="mb-4">
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría:</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.categoria ? 'border-red-500' : ''}`}
          >
            <option value="">Seleccione una opción</option>
            <option value="hardware">Desarrollo de Software</option>
            <option value="software">Infraestructura & cloud</option>
            <option value="servicios">Arquitectura de Software</option>
          </select>
          {errors.categoria && <p className="mt-1 text-sx text-red-600 font-medium" role="alert">{errors.categoria}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción:</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Ingrese una descripción detallada"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${errors.descripcion ? 'border-red-500' : ''}`}
          ></textarea>
          {errors.descripcion && <p className="mt-1 text-sx text-red-600 font-medium" role="alert">{errors.descripcion}</p>}
        </div>
        
        <button type="submit" className={`w-fill py-2 px-4 font-semibold text-white rounded-md transition-color ${
          isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'

          }`}>Guardar y Registrar Recurso</button>
      </form> 


    </div>

  )


}