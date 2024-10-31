
// queries.js

import { gql } from '@apollo/client';

const login = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

const createUser = gql`
  mutation createUser($user: NewUser!) {
    createUser(user: $user) {
      userId
      name
      email
      celular
      role
    }
  }
`;

const updateUser = gql`
  mutation updateUser($user: UpdatedUser!) {
    updateUser(user:$user) {
      userId
      name
      email
      celular
      role
    }
  }
`;

const deleteUser = gql`
  mutation deleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

export { login, createUser,updateUser, deleteUser };
