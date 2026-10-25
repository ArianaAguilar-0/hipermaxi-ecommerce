import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, ShoppingCart, Menu, X, LogOut, LayoutDashboard, Truck } from 'lucide-react';
import logo from '../assets/HiperLogo.png';
import { Drawer, DrawerContent } from '../components/ui/drawer';
import CarroCompra from '../componentes/carrito/CarroCompra';
import Buscador from '../componentes/tienda/Buscador';
import MenuCategorias from '../componentes/tienda/MenuCategorias';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Botón "Mi cuenta": enlace al login o menú con el usuario y cerrar sesión
const MiCuenta = () => {
  const { user, isAutenticated, esAdmin, logout } = useAuth();
  const [abierto, setAbierto] = useState(false);

  if (!isAutenticated) {
    return (
      <Link to="/login" className="flex flex-col items-center text-gray-700 transition hover:text-hiper-orange">
        <User size={24} strokeWidth={1.8} />
        <span className="mt-0.5 hidden text-xs font-medium sm:block">Mi cuenta</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        className="flex flex-col items-center text-hiper-navy transition hover:text-hiper-orange"
      >
        <User size={24} strokeWidth={1.8} />
        <span className="mt-0.5 hidden max-w-24 truncate text-xs font-semibold sm:block">{user?.nombre || user?.login}</span>
      </button>
      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border bg-white p-1 shadow-lg" onMouseLeave={() => setAbierto(false)}>
          {esAdmin && (
            <Link to="/admin/productos" onClick={() => setAbierto(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <LayoutDashboard size={16} /> Panel admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => { logout(); setAbierto(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

// Encabezado fijo de la tienda: logo, buscador, cuenta, carrito y categorías
export function Header() {
  const { totalItems, abierto, setAbierto } = useCart();
  const [menuMovil, setMenuMovil] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      {/* Franja superior */}
      <div className="hidden bg-hiper-navy-dark text-white/85 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-xs">
          <Truck size={14} /> Envío a domicilio o recoge en tu sucursal más cercana
        </div>
      </div>

      {/* Barra principal */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <button
          type="button"
          onClick={() => setMenuMovil((m) => !m)}
          className="rounded-lg p-1.5 text-hiper-navy hover:bg-gray-100 md:hidden"
          aria-label="Abrir categorías"
        >
          {menuMovil ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="shrink-0">
          <img src={logo} alt="Hipermaxi" className="h-10 w-auto object-contain sm:h-12" />
        </Link>

        <Buscador className="hidden max-w-2xl flex-1 md:block" />

        <div className="ml-auto flex items-center gap-5 md:ml-0">
          <MiCuenta />

          {/* Carrito con contador */}
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="relative flex flex-col items-center text-gray-700 transition hover:text-hiper-orange"
            aria-label={`Abrir carrito (${totalItems} productos)`}
          >
            <ShoppingCart size={24} strokeWidth={1.8} />
            {totalItems > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-hiper-orange px-1 text-[11px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
            <span className="mt-0.5 hidden text-xs font-medium sm:block">Carrito</span>
          </button>
        </div>
      </div>

      {/* Buscador en celular */}
      <div className="px-4 pb-3 md:hidden">
        <Buscador />
      </div>

      {/* Menú de categorías (escritorio) */}
      <nav className="hidden bg-hiper-navy md:block" aria-label="Categorías">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 [scrollbar-width:thin]">
          <MenuCategorias />
        </div>
      </nav>

      {/* Menú desplegable de categorías (celular) */}
      {menuMovil && (
        <nav className="max-h-[60vh] overflow-y-auto border-t bg-white px-4 py-3 shadow-lg md:hidden" aria-label="Categorías">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Categorías</p>
          <MenuCategorias vertical onElegir={() => setMenuMovil(false)} />
        </nav>
      )}

      {/* Panel lateral del carrito */}
      <Drawer open={abierto} onOpenChange={setAbierto}>
        <DrawerContent>
          <CarroCompra />
        </DrawerContent>
      </Drawer>
    </header>
  );
}

export default Header;
