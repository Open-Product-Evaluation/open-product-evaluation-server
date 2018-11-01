import client from '@/utils/client';
import gql from 'graphql-tag';


const getUsers = () => client.query(
  {
    query: gql`
    query getUsers {
      users {
        id
        lastUpdate
        creationDate
        firstName
        lastName
        email
        isAdmin
      }
    }`,
  },
);

const getUser = userID => client.query(
  {
    query: gql`
    query getUser {
      user(userID: "${userID}") {
        id
        lastUpdate
        creationDate
        firstName
        lastName
        email
        isAdmin
      }
    }`,
  },
);

const createUser = (firstname, lastname, email, password) => client.mutate(
  {
    mutation: gql`
    mutation createUser {
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
    }`,
  },
);

const updateUser = (userID, firstname, lastname, email, password = undefined) => {
  let passwordField = '';

  if (password !== undefined) {
    passwordField = `, password: "${password}$"`;
  }

  return client.mutate(
    {
      mutation: gql`
      mutation updateUser {
        updateUser(
          userID: "${userID}",
          data: {
            firstName: "${firstname}",
            lastName: "${lastname}",
            email: "${email}"
            ${passwordField}
          }
        ) {
          user {
            id
            firstName
            lastName
            email
            isAdmin
          }
        }
      }`,
    },
  );
};


const deleteUser = userID => client.mutate(
  {
    mutation: gql`
    mutation deleteUser {
      deleteUser(userID: "${userID}") {
        success
      }
    }`,
  },
);

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
