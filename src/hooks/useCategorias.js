import { useEffect, useState } from 'react';
import CategoriasService from '../services/categoriasService';
import { getErrorMessage } from '../services/dolibarrClient';

// Las categorías casi no cambian: se piden una sola vez y se comparten
// entre el Header y el Inicio (se guarda la promesa en memoria).
let peticion = null;

const cargarCategorias = () => {
  if (!peticion) {
    peticion = CategoriasService.getCategoriasProducto().catch((err) => {
      peticion = null; // si falla, el próximo intento vuelve a pedirlas
      throw err;
    });
  }
  return peticion;
};

/** Categorías de productos de Dolibarr para el menú y el inicio. */
export const useCategorias = () => {
  const [estado, setEstado] = useState({ categorias: [], loading: true, error: '' });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    cargarCategorias()
      .then((categorias) => activo && setEstado({ categorias, loading: false, error: '' }))
      .catch((err) => activo && setEstado({ categorias: [], loading: false, error: getErrorMessage(err) }));
    return () => {
      activo = false;
    };
  }, [intento]);

  const recargar = () => {
    setEstado((e) => ({ ...e, loading: true, error: '' }));
    setIntento((n) => n + 1);
  };

  return { ...estado, recargar };
};

export default useCategorias;
