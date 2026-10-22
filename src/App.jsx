import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
// import { Card } from './componentes/Card'
import "@fortawesome/fontawesome-free/css/all.min.css";
// import 'flowbite/dist/flowbite.min.js'
// import "flowbite";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';


function App() {
  const [count, setCount] = useState(0)
  
  return (

    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
    
  )
}

export default App
