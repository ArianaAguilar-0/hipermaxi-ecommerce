import apiClient from './apiClient';

// Obtener listado Completo de recursos

export const getRecursos = async () => {
  const response = await apiClient.get('/posts');
  return response.data;
};

// Obtener solo un recurso

export const getRecursoById = async (id) => {
  const response = await apiClient.get(`/posts/${id}`);
  return response.data;
};

// Enviar solicitud para crear un nuevo recurso
export const createRecurso = async (data) => {
  const response = await apiClient.post('/posts', data);
  return response.data;
};