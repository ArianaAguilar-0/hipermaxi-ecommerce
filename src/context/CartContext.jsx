import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

// Clave de localStorage donde se guarda el carrito
const CART_KEY = 'hiper_carrito';

// Lee el carrito guardado; si está dañado o no hay acceso, empieza vacío
const leerCarrito = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(guardado)
      ? guardado.filter((i) => i && i.id && Number(i.cantidad) > 0)
      : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(leerCarrito);
  // Estado del panel lateral (drawer) del carrito
  const [abierto, setAbierto] = useState(false);

  // Guarda el carrito en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // Sin acceso a localStorage: el carrito funciona, pero no se conserva al recargar
    }
  }, [items]);

  /**
   * Agrega un producto sin superar su stock.
   * Devuelve { ok, mensaje } para mostrar la notificación.
   */
  const agregar = (producto, cantidad = 1) => {
    const stock = Number(producto.stock) || 0;
    if (stock <= 0) return { ok: false, mensaje: 'Producto sin stock' };

    const actual = items.find((i) => i.id === producto.id)?.cantidad ?? 0;
    const nueva = Math.min(actual + cantidad, stock);
    if (nueva === actual) {
      return { ok: false, mensaje: `Solo hay ${stock} unidades de ${producto.label}` };
    }

    const item = {
      id: producto.id,
      ref: producto.ref,
      label: producto.label,
      precio: Number(producto.precio) || 0,
      tva_tx: Number(producto.tva_tx) || 0,
      stock,
      cantidad: nueva,
    };
    setItems((prev) =>
      prev.some((i) => i.id === producto.id)
        ? prev.map((i) => (i.id === producto.id ? item : i))
        : [...prev, item]
    );

    const agregadas = nueva - actual;
    return {
      ok: true,
      mensaje:
        agregadas < cantidad
          ? `Se agregaron ${agregadas} (stock máximo: ${stock})`
          : `${producto.label} agregado al carrito`,
    };
  };

  // Cambia la cantidad entre 1 y el stock disponible
  const cambiarCantidad = (id, cantidad) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cantidad: Math.max(1, Math.min(Number(cantidad) || 1, i.stock)) } : i
      )
    );
  };

  // Actualiza precio y stock de un ítem con datos frescos de Dolibarr (antes de pagar)
  const actualizarItem = (id, { precio, stock }) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, precio, stock, cantidad: Math.max(1, Math.min(i.cantidad, stock)) } : i
      )
    );
  };

  const quitar = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const vaciar = () => setItems([]);

  const totalItems = items.reduce((t, i) => t + i.cantidad, 0);
  const subtotal = items.reduce((t, i) => t + i.precio * i.cantidad, 0);

  const value = {
    items, totalItems, subtotal,
    agregar, cambiarCantidad, actualizarItem, quitar, vaciar,
    abierto, setAbierto,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};
