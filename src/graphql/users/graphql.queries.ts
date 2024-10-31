import { gql } from '@apollo/client';

const getUsers = gql`
  query getUsers($page: Int!, $size: Int!) {
    getUsers(page: $page, size: $size) {
      pageInfo {
        totalPaginas
        totalElementos
        paginaActual
        pageSize
      }
      items {
        userId
        name
        email
        celular
        role
      }
    }
  }
`;

 const getUser = gql`
  query getUser($email: String!) {
    getUser(email: $email) {
      userId
      name
      email
      celular
      password
      role
    }
  }
`;
export { getUsers ,getUser};
