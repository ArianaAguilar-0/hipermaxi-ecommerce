// QR GENÉRICO DE DEMOSTRACIÓN: es solo un dibujo con forma de QR.
// No contiene datos bancarios ni se puede usar para pagar.
const N = 25;

// Generador pseudoaleatorio simple para que el dibujo sea siempre el mismo
const crearAleatorio = (semilla) => {
  let s = semilla || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
};

// Los tres cuadrados de las esquinas típicos de un QR
const esEsquina = (x, y) => {
  const en = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
  return en(0, 0) || en(N - 7, 0) || en(0, N - 7);
};

const Esquina = ({ x, y }) => (
  <g>
    <rect x={x} y={y} width="7" height="7" fill="currentColor" />
    <rect x={x + 1} y={y + 1} width="5" height="5" fill="white" />
    <rect x={x + 2} y={y + 2} width="3" height="3" fill="currentColor" />
  </g>
);

export const QrDemo = ({ semilla = 7, className = '' }) => {
  const aleatorio = crearAleatorio(semilla);
  const modulos = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (!esEsquina(x, y) && aleatorio() > 0.5) modulos.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  }

  return (
    <div className={`relative inline-block rounded-2xl bg-white p-3 text-hiper-navy shadow ${className}`}>
      <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} className="h-48 w-48" role="img" aria-label="QR de demostración">
        <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="white" />
        <g fill="currentColor">{modulos}</g>
        <Esquina x={0} y={0} />
        <Esquina x={N - 7} y={0} />
        <Esquina x={0} y={N - 7} />
      </svg>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] rounded-md bg-hiper-orange px-2 py-1 text-xs font-extrabold tracking-widest text-white shadow">
        DEMO
      </span>
    </div>
  );
};

export default QrDemo;
