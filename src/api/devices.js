import client from '@/utils/client';
import gql from 'graphql-tag';

const updateDeviceContext = (deviceID, contextID) => {
  let contextQuery = 'null';

  if (contextID !== null) {
    contextQuery = `"${contextID}"`;
  }

  return client.mutate(
    {
      mutation: gql`
      mutation updateDevice {
        updateDevice(
          data: {
            context: ${contextQuery}
          },
          deviceID: "${deviceID}"
        ) {
          device {
            id
            name
            owners {
              id
              firstName
              lastName
            }
            context {
              id
              activeSurvey {
                id
                title
              }
            }
          }
        }
      }`,
    },
  );
};

const updateDevice = (deviceID, name) => client.mutate(
  {
    mutation: gql`
    mutation updateDevice {
      updateDevice(
        data: {
          name: "${name}"
        },
        deviceID: "${deviceID}"
      )
      {
        device {
          id
          name
          owners {
            id
            firstName
            lastName
          }
          context {
            id
            activeSurvey {
              id
              title
            }
          }
        }
      }
    }`,
  },
);

const createDevice = name => client.mutate(
  {
    mutation: gql`
    mutation createDevice {
      createDevice(data: { name: "${name}"}) {
        device { id }
        token
      }
    }`,
  },
);

const getDevice = deviceID => client.query(
  {
    query: gql`
    query getDevice {
      device(deviceID: "${deviceID}") {
        id
        name
        owners {
          id
          firstName
          lastName
        }
        context {
          id
          activeSurvey {
            id
            title
          }
        }
      }
    }`,
  },
);

const getDevices = () => client.query(
  {
    query: gql`
    query getDevices {
      devices {
        id
        name
        owners {
          id
          firstName
          lastName
        }
        context {
          id
          activeSurvey {
            id
            title
          }
        }
      }
    }`,
  },
);

const deleteDevice = deviceID => client.mutate(
  {
    mutation: gql`
    mutation deleteDevice {
      {
        deleteDevice(deviceID: "${deviceID}") { status }
      }
    }`,
  },
);

export default {
  getDevice,
  getDevices,
  createDevice,
  updateDevice,
  updateDeviceContext,
  deleteDevice,
};
