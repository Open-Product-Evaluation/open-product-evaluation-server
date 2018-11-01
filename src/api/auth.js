import client from '@/utils/client';
import gql from 'graphql-tag';

const login = (email, password) => client.mutate(
  {
    mutation: gql`
      mutation login {
        login(data: {email: "${email}", password: "${password}"}) {
          user {
            id
            creationDate
            lastUpdate
            email
            firstName
            lastName
            isAdmin
          }
          token
        }
      }`,
  },
);

const register = (firstname, lastname, email, password) => client.mutate(
  {
    mutation: gql`
    mutation register {
      createUser(
        data: {
          firstName: "${firstname}",
          lastName: "${lastname}",
          email: "${email}",
          password: "${password}"
        }
      ) {
        user {
          id
          creationDate
          lastUpdate
          email
          firstName
          lastName
          isAdmin
        }
        token
      }
    }
    `,
  },
);

export default {
  login,
  register,
};
