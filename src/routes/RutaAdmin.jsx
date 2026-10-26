import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../shimer/pulse/EmptyState';

// Protege las rutas de administración: sin sesión → login; sin rol admin → acceso restringido
const RutaAdmin = ({ children }) => {
  const { isAutenticated, esAdmin } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (!isAutenticated) return <Navigate to="/login" replace state={{ volver: pathname }} />;
  if (!esAdmin) {
    return (
      <EmptyState
        message="Esta sección es solo para administradores del e-commerce."
        onAction={() => navigate('/')}
        actionLabel="Volver a la tienda"
      />
    );
  }
  return children;
};

export default RutaAdmin;
