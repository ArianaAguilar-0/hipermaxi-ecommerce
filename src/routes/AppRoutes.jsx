import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import MainLayout from '../layouts/MainLayout';
import Login from '../componentes/LoginForm';
import ProductDetail from '../pages/ProductDetail';
import Inicio from '../pages/Inicio';
import ProductosDolibarr from '../pages/ProductosDolibarr';

// Todas las rutas de la aplicación
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<MainLayout />} >
          <Route index element={<Inicio />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          {/* Panel de administrador (se protege por rol en la Fase 3) */}
          <Route path="/admin/productos" element={<ProductosDolibarr />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
