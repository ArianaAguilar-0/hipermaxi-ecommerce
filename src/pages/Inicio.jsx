import React from 'react';
import ContadorPersistente from '../componentes/ContadorPersistente';
import TemporizadorOnline from '../componentes/TemporizadorOnline';
import { EjemploFetch } from '../examples/ejemploFetch';
import {EjemploAxios} from '../examples/EjemploAxios';
import CardSkeleton  from '../Moleculas/CardSkeleton'
import DialogDemo from '@/examples/DialogDemo';
export const Inicio = () => {

  return (
    <>
    {/* <ContadorPersistente /> */}
    {/* <TemporizadorOnline /> */}
    {/* <EjemploFetch /> */}
    {/* <EjemploAxios /> */}
    {/* <CardSkeleton /> */}
    <DialogDemo />
    </>
    
  );
}

export default Inicio;