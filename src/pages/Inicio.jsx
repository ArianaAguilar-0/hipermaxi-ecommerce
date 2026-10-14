import React from 'react';
import ContadorPersistente from '../componentes/ContadorPersistente';
import TemporizadorOnline from '../componentes/TemporizadorOnline';
import { EjemploFetch } from '../examples/ejemploFetch';
import {EjemploAxios} from '../examples/EjemploAxios';

export const Inicio = () => {

  return (
    <>
    {/* <ContadorPersistente /> */}
    {/* <TemporizadorOnline /> */}
    {/* <EjemploFetch /> */}
    <EjemploAxios />
    </>
    
  );
}

export default Inicio;