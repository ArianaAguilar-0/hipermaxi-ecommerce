import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Buscador del Header: lleva a /tienda?q=texto
export const Buscador = ({ className = '' }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { esAdmin } = useAuth();
  const qUrl = params.get('q') || '';
  const [texto, setTexto] = useState(qUrl);

  // Si cambia la búsqueda en la URL (por ejemplo al elegir una categoría), se actualiza la caja
  const [qAnterior, setQAnterior] = useState(qUrl);
  if (qUrl !== qAnterior) {
    setQAnterior(qUrl);
    setTexto(qUrl);
  }

  const buscar = (e) => {
    e.preventDefault();
    const q = texto.trim();
    navigate(q ? `/tienda?q=${encodeURIComponent(q)}` : '/tienda');
  };

  return (
    <form onSubmit={buscar} role="search" className={`relative w-full ${className}`}>
      <input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        maxLength={60}
        placeholder={esAdmin ? 'Buscar por nombre o código…' : '¿Qué estás buscando hoy?'}
        aria-label="Buscar productos"
        className="w-full rounded-full border-2 border-gray-200 bg-gray-50 py-2.5 pl-5 pr-14 text-sm text-gray-800 outline-none transition focus:border-hiper-orange focus:bg-white"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-hiper-orange text-white transition hover:bg-hiper-orange-dark"
      >
        <Search size={18} />
      </button>
    </form>
  );
};

export default Buscador;
