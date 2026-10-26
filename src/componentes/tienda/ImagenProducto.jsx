import { useState } from 'react';
import useImagenProducto from '@/hooks/useImagenProducto';
import { IMAGEN_GENERICA } from '@/lib/imagenesCategorias';

// Imagen cuadrada de producto: foto de Dolibarr (carga diferida) o ilustración de su categoría
export const ImagenProducto = ({ producto, className = '' }) => {
  const { ref, src, esFoto, cargando } = useImagenProducto(producto?.id);
  // Si la imagen no se puede mostrar (archivo dañado), se usa la ilustración genérica
  const [fallida, setFallida] = useState(null);
  const usarGenerica = fallida !== null && fallida === src;

  return (
    <div ref={ref} className={`relative aspect-square w-full overflow-hidden rounded-xl bg-hiper-orange-light ${className}`}>
      {cargando ? (
        <div className="absolute inset-0 animate-pulse bg-hiper-orange-light" aria-hidden="true" />
      ) : (
        <img
          src={usarGenerica ? IMAGEN_GENERICA : src}
          alt={producto?.label || 'Producto'}
          loading="lazy"
          decoding="async"
          onError={() => setFallida(src)}
          className={`h-full w-full ${esFoto && !usarGenerica ? 'object-cover' : 'object-contain'}`}
        />
      )}
    </div>
  );
};

export default ImagenProducto;
