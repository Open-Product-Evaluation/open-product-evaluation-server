import client from '@/utils/client';
import gql from 'graphql-tag';

const createSurvey = (title, description) => client.mutate(
  {
    mutation: gql`
    mutation createSurvey {
      createSurvey(
        data: {
          title: "${title}",
          description: "${description}"
        }
      ) {
        survey {
          id
          title
          description
          isPublic
        }
      }
    }`,
  },
);

const updateSurvey = (surveyID, title, description, visiblity) => {
  let titleData = '';
  let descriptionData = '';
  let visiblityData = '';

  if (title !== null && title !== undefined) {
    // eslint-disable-next-line
    titleData = `title: "${title.replace(/"/g, '\\\"')}"`;

    if ((description !== null && description !== undefined)
      || (visiblity !== null && visiblity !== undefined)) {
      titleData += ',';
    }
  }

  if (description !== null && description !== undefined) {
    // eslint-disable-next-line
    descriptionData = `description: "${description.replace(/"/g, '\\\"')}"`;

    if (visiblity !== null && visiblity !== undefined) {
      descriptionData += ',';
    }
  }

  if (visiblity !== null && visiblity !== undefined) {
    visiblityData = `isPublic: ${visiblity}`;
  }

  return client.mutate(
    {
      mutation: gql`
      mutation updateSurvey {
       updateSurvey(
         surveyID: "${surveyID}",
         data: {
           ${titleData}
           ${descriptionData}
           ${visiblityData}
         }
       ) {
         survey {
           id
           title
           isPublic
           description
           types
           questions {
             id
             value
             type
             description
             items {
               id
               label
               image {
                 id
                 url
                 name
                 type
                 hash
                 tags
                 creationDate
               }
             }
             ... on RegulatorQuestion {
               min
               max
               default
               stepSize
               labels {
                 id
                 label
                 value
                 image {
                   id
                   url
                   name
                   type
                   hash
                   tags
                   creationDate
                 }
               }
             }
             ... on ChoiceQuestion {
               choices {
                 id
                 code
                 label
                 image {
                   id
                   url
                   name
                   type
                   hash
                   tags
                   creationDate
                 }
               }
             }
           }
           votes {
             id
             context
             answers {
               question
               ... on LikeAnswer {question liked}
               ... on LikeDislikeAnswer {question liked}
               ... on ChoiceAnswer {question choice}
               ... on RegulatorAnswer {question rating normalized}
               ... on RankingAnswer {question rankedItems}
               ... on FavoriteAnswer {question favoriteItem}
             }
           }
           images {
             id
             url
             name
             type
             hash
             tags
             creationDate
           }
           contexts { id }
           lastUpdate
           creationDate
           creator {
             id
             lastName
             firstName
             email
             creationDate
             lastUpdate
           }
         }
       }
      }`,
    },
  );
};

const deleteSurvey = surveyID => client.mutate(
  {
    mutation: gql`
    mutation deleteSurvey {
      deleteSurvey(surveyID: "${surveyID}") {
        success
      }
    }`,
  },
);

const getSurveys = () => client.query(
  {
    query: gql`
    query getSurveys {
      surveys {
        id
        title
        isPublic
        description
        types
        questions {
          id
          value
          type
          description
          ... on RegulatorQuestion {
            labels {
              image { id }
            }
          }
          ... on ChoiceQuestion {
            choices {
              id
              code
              label
              image { id }
            }
          }
          ... on RankingQuestion {
            items {
              image {id}
            }
          }
          ... on FavoriteQuestion {
            items {
              image {id}
            }
          }
        }
        votes {
          id
          context
          answers {
            question
            ... on LikeAnswer {question liked}
            ... on LikeDislikeAnswer {question liked}
            ... on ChoiceAnswer {question choice}
            ... on RegulatorAnswer {question rating normalized}
            ... on RankingAnswer {question rankedItems}
            ... on FavoriteAnswer {question favoriteItem}
          }
        }
        images {
          id
          url
          name
          type
          hash
          tags
          creationDate
        }
        contexts { id }
        lastUpdate
        creationDate
        creator {
          id
          lastName
          firstName
          email
          creationDate
          lastUpdate
        }
      }
    }`,
  },
);

const uploadImage = (surveyID, file, tags) => {
  let tagData = '';

  for (let i = 0; i < tags.length; i += 1) {
    tagData += `"${tags[i].text}"`;

    if (i !== (tags.length - 1)) {
      tagData += ',';
    }
  }

  return client.mutate(
    {
      mutation: gql`
      mutation createImage($file: Upload!) {
        createBonusImage(data:
          {
            tags: [${tagData}],
            surveyID: "${surveyID}"},
            image: $file)
          {
          image {
            id
            name
            url
            hash
            creationDate
            tags
          }
        }
      }`,
      variables: { file },
    },
  );
};

const getSurvey = surveyID => client.query(
  {
    query: gql`
    query getSurvey {
      survey(surveyID: "${surveyID}") {
        id
        title
        isPublic
        description
        types
        questions {
          id
          value
          type
          description
          items {
            id
            label
            image {
              id
              url
              name
              type
              hash
              tags
              creationDate
            }
          }
          ... on RegulatorQuestion {
            min
            max
            default
            stepSize
            labels {
              id
              label
              value
              image {
                id
                url
                name
                type
                hash
                tags
                creationDate
              }
            }
          }
          ... on ChoiceQuestion {
            choiceDefault: default
            choices {
              id
              code
              label
              image {
                id
                url
                name
                type
                hash
                tags
                creationDate
              }
            }
          }
        }
        votes {
          id
          context
          device
          creationDate
          answers {
            question
            ... on LikeAnswer {question liked}
            ... on LikeDislikeAnswer {question liked}
            ... on ChoiceAnswer {question choice}
            ... on RegulatorAnswer {question rating normalized}
            ... on RankingAnswer {question rankedItems}
            ... on FavoriteAnswer {question favoriteItem}
          }
        }
        images {
          id
          url
          name
          type
          hash
          tags
          creationDate
        }
        contexts { id }
        lastUpdate
        creationDate
        creator {
          id
          lastName
          firstName
          email
          creationDate
          lastUpdate
        }
      }
    }`,
  },
);

const deleteImage = imageID => client.mutate(
  {
    mutation: gql`
    mutation deleteImage {
      deleteBonusImage(
        imageID: "${imageID}"
      ) {
        success
      }
    }`,
  },
);

export default {
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveys,
  getSurvey,
  uploadImage,
  deleteImage,
};
