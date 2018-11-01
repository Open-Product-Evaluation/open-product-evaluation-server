import client from '@/utils/client';
import gql from 'graphql-tag';

const getContext = contextID => client.query(
  {
    query: gql`
    query getContext {
      context(contextID: "${contextID}") {
        id
        name
        activeSurvey {
          id
          title
          description
          isPublic
        }
        activeQuestion { id }
        states { key value }
        devices {
          id
          name
          owners { id firstName lastName }
        }
      }
    }`,
  },
);

const getContexts = () => client.query(
  {
    query: gql`
    query getContexts {
      contexts {
        owners { id }
        id
        name
        activeSurvey {
          id
          title
          description
          isPublic
        }
        activeQuestion {id value}
        states { key value }
        devices {
          id
          name
          owners { id firstName lastName }
        }
      }
    }`,
  },
);

const createContext = name => client.mutate(
  {
    mutation: gql`
    mutation createContext {
      createContext(
        data: { name: "${name}" }
      ) {
        context {
          id
          name
          activeSurvey {
            id
            title
            description
            isPublic
          }
          activeQuestion { id }
          states { key value }
          devices {
            id
            name
            owners { id firstName lastName }
          }
        }
      }
    }`,
  },
);

const updateContext = (contextID, name, surveyID) => {
  let surveyQuery = '';

  if (surveyID !== 'null') {
    surveyQuery = `"${surveyID}"`;
  } else {
    surveyQuery = surveyID;
  }

  return client.mutate(
    {
      mutation: gql`
      mutation updateContext {
        updateContext(
          contextID: "${contextID}",
          data: {
            name: "${name}",
            activeSurvey: ${surveyQuery}
          }
        ) {
          context {
            id
            name
            activeSurvey {
              id
              title
              description
              isPublic
            }
            activeQuestion { id }
            states { key value }
            devices {
              id
              name
              owners { id firstName lastName }
            }
          }
        }
      }`,
    },
  );
};

const deleteContext = contextID => client.mutate(
  {
    mutation: gql`
    mutation deleteContext {
      deleteContext(contextID: "${contextID}") { success }
    }`,
  },
);

export default {
  getContext,
  getContexts,
  createContext,
  updateContext,
  deleteContext,
};
