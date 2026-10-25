import { ShoppingBasket } from 'lucide-react';

// Tonos suaves para los placeholders (los productos de Dolibarr no tienen foto)
const TONOS = [
  'bg-hiper-orange-light text-hiper-orange',
  'bg-hiper-navy-light text-hiper-navy',
  'bg-emerald-50 text-emerald-600',
  'bg-amber-50 text-amber-600',
  'bg-sky-50 text-sky-600',
  'bg-rose-50 text-rose-500',
];

// Imagen cuadrada de producto: placeholder con ícono e iniciales
export const ImagenProducto = ({ producto, className = '', tamano = 'md' }) => {
  const tono = TONOS[Number(producto?.id || 0) % TONOS.length];
  const iniciales = (producto?.label || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  const grande = tamano === 'lg';

  return (
    <div className={`flex aspect-square w-full flex-col items-center justify-center rounded-xl ${tono} ${className}`}>
      <ShoppingBasket className={grande ? 'h-20 w-20' : 'h-10 w-10'} strokeWidth={1.5} />
      <span className={`mt-2 font-bold tracking-wider opacity-70 ${grande ? 'text-2xl' : 'text-sm'}`}>
        {iniciales}
      </span>
    </div>
  );
};

export default ImagenProducto;
