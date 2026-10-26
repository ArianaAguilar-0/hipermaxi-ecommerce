// Ilustraciones propias por categoría (src/assets/categorias/*.webp), usadas cuando un producto no tiene foto.
const archivos = import.meta.glob('../assets/categorias/*.webp', { eager: true, import: 'default' });

const porNombre = Object.fromEntries(
  Object.entries(archivos).map(([ruta, url]) => [ruta.split('/').pop().replace('.webp', ''), url])
);

// "Utiles Escolares" → "utiles-escolares", "Productos de punto de venta (POS)" → "productos-de-punto-de-venta-pos"
export const slugCategoria = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const IMAGEN_GENERICA = porNombre.generica;

/** Ilustración de una categoría de Dolibarr (o la genérica si no hay una para ella). */
export const imagenDeCategoria = (nombreCategoria) => porNombre[slugCategoria(nombreCategoria)] || IMAGEN_GENERICA;
