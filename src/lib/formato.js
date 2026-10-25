// Formatea un monto en bolivianos: 7.5 → "Bs 7,50"
export const formatearBs = (monto) =>
  `Bs ${Number(monto || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
