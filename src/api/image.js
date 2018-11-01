import client from '@/utils/client';
import gql from 'graphql-tag';

const updateImage = (imageID, tags) => client.mutate(
  {
    mutation: gql`
      mutation updateImage {
        updateImage(
          imageID: ${imageID},
          data: { tags: ${tags} }) {
          image {
            id
            hash
            url
            creationDate
            tags
            name
            type
          }
        }
      }`,
  },
);


export default {
  updateImage,
};
