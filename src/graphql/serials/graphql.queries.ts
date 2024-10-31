import { gql } from '@apollo/client';

const getSerials = gql`
  query getSerials($page: Int!, $size: Int!) {
    getSerials(page: $page, size: $size) {
      pageInfo {
        totalPaginas
        totalElementos
        paginaActual
        pageSize
      }
      items {
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
  }
`;

const getAllSerials = gql`
  query getAllSerials {
    getAllSerials {
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

 const getSerial = gql`
  query getSerial($serialCode: String!) {
    getSerial(serialCode: $serialCode) {
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
export { getSerials ,getSerial, getAllSerials};
