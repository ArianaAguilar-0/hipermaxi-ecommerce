
import React, { useState, useEffect } from 'react';

/**
 * Componente que demuestra el aislamiento de efectos independientes (SRP)
 * con sus respectivas funciones de limpieza para evitar Memory Leaks.
 */
export const TemporizadorOnline = () => {
  const [estaOnline, setEstaOnline] = useState(navigator.onLine);
  const [segundosSeguidos, setSegundosSeguidos] = useState(0);

  // Efecto 1: Suscripción a eventos de red globales del navegador
  useEffect(() => {
    const manejarOnline = () => setEstaOnline(true);
    const manejarOffline = () => setEstaOnline(false);

    window.addEventListener('online', manejarOnline);
    window.addEventListener('offline', manejarOffline);

    // Cleanup 1: Remoción explícita de event listeners al desmontar
    return () => {
      window.removeEventListener('online', manejarOnline);
      window.removeEventListener('offline', manejarOffline);
    };
  }, []); // [] = Registro único al montar

  // Efecto 2: Gestión del temporizador a intervalos
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSegundosSeguidos(prev => prev + 1);
    }, 1000);

    // Cleanup 2: Cancelación del temporizador activo para evitar memory leaks
    return () => {
      clearInterval(intervalId);
    };
  }, []); // [] = Registro único al montar

  return (
    <div>
      <h3>Estado de Red y Tiempo Activo</h3>
      <div>
        <span>Estado de Conexión:</span>
        <span>
          {estaOnline ? 'Conectado (Online)' : 'Desconectado (Offline)'}
        </span>
      </div>
      <p>
        Tiempo transcurrido en la sesión: <span>{segundosSeguidos} segundos</span>
      </p>
    </div>
  );
};

export default TemporizadorOnline;
