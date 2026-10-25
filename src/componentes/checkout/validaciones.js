// Validaciones de formato del checkout (no consultan ningún servicio externo)

const EMAIL = /^[^\s@'"]+@[^\s@'"]+\.[^\s@'"]{2,}$/;

/** Datos de facturación compatibles con el tercero de Dolibarr. */
export const validarCliente = (c) => {
  const e = {};
  if (!c.nombre?.trim() || c.nombre.trim().length < 3) e.nombre = 'Ingresa el nombre o razón social';
  if (!/^\d{5,15}(-?[0-9A-Z]{1,3})?$/i.test(c.nit?.trim() || '')) e.nit = 'NIT o CI inválido (solo números, ej. 1234567)';
  if (!EMAIL.test(c.email?.trim() || '')) e.email = 'Correo inválido';
  const tel = (c.telefono || '').replace(/[\s-]/g, '');
  if (!/^\+?\d{7,15}$/.test(tel)) e.telefono = 'Teléfono inválido (7 a 15 dígitos)';
  if (!c.direccion?.trim() || c.direccion.trim().length < 5) e.direccion = 'Ingresa la dirección';
  return e;
};

export const validarEntrega = (en) => {
  const e = {};
  if (en.tipo === 'tienda' && !en.sucursal) e.sucursal = 'Elige una sucursal';
  if (en.tipo === 'domicilio' && (!en.direccion?.trim() || en.direccion.trim().length < 5)) {
    e.direccionEntrega = 'La dirección de entrega es obligatoria';
  }
  return e;
};

// Algoritmo de Luhn: detecta números de tarjeta mal escritos
const luhn = (num) => {
  let suma = 0;
  let doble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (doble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    suma += d;
    doble = !doble;
  }
  return suma % 10 === 0;
};

/** Tarjeta: solo formato. Los datos nunca se guardan ni se envían. */
export const validarTarjeta = (t) => {
  const e = {};
  const numero = (t.numero || '').replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(numero) || !luhn(numero)) e.numero = 'Número de tarjeta inválido';
  if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]{3,}$/.test(t.nombre?.trim() || '')) e.nombre = 'Nombre como figura en la tarjeta';

  const m = /^(\d{2})\/(\d{2})$/.exec(t.vencimiento || '');
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) {
    e.vencimiento = 'Usa el formato MM/AA';
  } else {
    // La tarjeta vence al final del mes indicado
    const fin = new Date(2000 + Number(m[2]), Number(m[1]), 1);
    if (fin <= new Date()) e.vencimiento = 'La tarjeta está vencida';
  }
  if (!/^\d{3,4}$/.test(t.cvv || '')) e.cvv = 'CVV de 3 o 4 dígitos';
  return e;
};

// Formatos mientras se escribe
export const formatearNumeroTarjeta = (v) =>
  v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');

export const formatearVencimiento = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
