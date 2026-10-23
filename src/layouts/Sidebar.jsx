import { NavLink } from 'react-router-dom';

// Enlaces agrupados por sección
const secciones = [
  {
    titulo: 'Ejercicios',
    enlaces: [
      { to: '/uncontrolinput', label: 'Uncontrolinput' },
      { to: '/controlledInput', label: 'ControlledInput' },
      { to: '/formulario', label: 'Formulario' },
    ],
  },
  {
    titulo: 'Cuenta',
    enlaces: [{ to: '/login', label: 'Login' }],
  },
];

// Estilo dinámico para resaltar el enlace activo
const getLinkStyle = ({ isActive }) => ({
  display: 'block',
  padding: '6px 10px',
  borderRadius: '6px',
  color: isActive ? 'blue' : 'black',
  fontWeight: isActive ? 'bold' : 'normal',
  backgroundColor: isActive ? '#e0e7ff' : 'transparent',
  textDecoration: 'none',
});

export function Sidebar() {
  return (
    <aside style={{ width: '220px', flexShrink: 0, backgroundColor: '#f8f8f8', borderRight: '1px solid #e5e5e5', padding: '16px 10px' }}>
      <nav>
        {secciones.map((seccion) => (
          <div key={seccion.titulo} style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', margin: '0 10px 8px' }}>
              {seccion.titulo}
            </p>
            {seccion.enlaces.map((enlace) => (
              <NavLink key={enlace.to} to={enlace.to} style={getLinkStyle}>
                {enlace.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
