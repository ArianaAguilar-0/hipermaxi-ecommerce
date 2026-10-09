import React from 'react';
import { NavLink, Outlet} from 'react-router-dom';

export function MainLayout() {

  const getNavStyle = ({isActive}) => ({
    margin: '0 10px',
    color: isActive ? 'blue' : 'black',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: isActive ? 'underline' : 'none',
  });

  return (
    <div className="layout-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>
        <h1>Tienda Smart</h1>
        <nav className="mt-1">
          <NavLink to="/" style={getNavStyle}>Inicio</NavLink>
          <NavLink to="/productos" style={getNavStyle}>Productos</NavLink>
          <NavLink to="/contacto" style={getNavStyle}>Contacto</NavLink>
          <NavLink to="/uncontrolinput" style={getNavStyle}>Uncontrolinput</NavLink>
          <NavLink to="/controlledInput" style={getNavStyle}>ControlledInput</NavLink>
          <NavLink to="/formulario" style={getNavStyle}> Formulario </NavLink>

        </nav>  
      </header>
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
      <footer style={{ backgroundColor: '#f0f0f0', padding: '10px', textAlign: 'center' }}>
        <p>&copy; 2026 Tienda Smart. Todos los derechos reservados.</p>
      </footer>

    </div>

  );

}
export default MainLayout;