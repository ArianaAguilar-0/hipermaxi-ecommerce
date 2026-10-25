import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// Estructura general de la tienda: Header, contenido y Footer
export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
