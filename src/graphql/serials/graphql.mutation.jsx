
// queries.js

import { gql } from '@apollo/client';


const createSerial = gql`
  mutation createSerial($duracion: Int!) {
   createSerial(duracion: $duracion) {
        serialId
        serialCode
        duracion
        dias_restantes
        fecha_activacion
        fecha_finalizacion
        vigente
        activado
    }
  }
`;

const updateSerial = gql`
  mutation updateSerial($serial: SerialUpdate!) {
    updateSerial(serial:$serial) {
      serialId
        serialCode
        duracion
        dias_restantes
        fecha_activacion
        fecha_finalizacion
        vigente
        activado
    }
  }
`;

const deleteSerial = gql`
  mutation deleteSerial($serialId: ID!) {
    deleteSerial(serialId: $serialId)
  }
`;

export {  createSerial,updateSerial, deleteSerial };
