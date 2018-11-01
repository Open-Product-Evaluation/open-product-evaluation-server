import client from '@/utils/client';
import gql from 'graphql-tag';

const createQuestion = surveyID => client.mutate(
  {
    mutation: gql`
    mutation createQuestion {
      createQuestion(
        data: {
          surveyID: "${surveyID}",
          type: CHOICE,
          description: null,
          value: ""
        }
      ) {
        question {
          id
          type
          value
          lastUpdate
          description
          creationDate
          __typename
        }
      }
    }`,
  },
);

const updateQuestion = (questionID, value, description = undefined, type = undefined) => {
  let descriptionData = '';
  let typeData = '';
  let valueData = '';

  if (value !== null) {
    valueData = value;
  }

  if (description !== undefined && description !== null) {
    descriptionData = `, description: "${description}"`;
  }

  if (description === null) {
    descriptionData = ', description: ""';
  }

  if (type !== undefined) {
    typeData = `, type: ${type}`;
  }

  return client.mutate(
    {
      mutation: gql`
      mutation updateQuestion {
        updateQuestion(
          questionID: "${questionID}",
          data: {
            value: "${valueData}"
            ${descriptionData}
            ${typeData}
          }
        ) {
          question {
            id
            type
            value
            lastUpdate
            description
            creationDate
            __typename
            ... on RegulatorQuestion {
              min
              max
              default
              stepSize
            }
          }
        }
      }`,
    },
  );
};

const updateRegulatorQuestion = (questionID, min, max, stepSize, d) => {
  const minValue = parseFloat(min);
  const maxValue = parseFloat(max);
  const stepValue = parseFloat(stepSize);
  const defaultValue = parseFloat(d);

  return client.mutate(
    {
      mutation: gql`
      mutation updateRegulatorQuestion {
        updateQuestion(
          questionID: "${questionID}",
          data: {
            min: ${minValue},
            max: ${maxValue},
            regulatorDefault: ${defaultValue},
            stepSize: ${stepValue}
          }
        ) {
          question {
            id
            type
            value
            lastUpdate
            description
            creationDate
            __typename
            ... on RegulatorQuestion {
              min
              max
              default
              stepSize
            }
          }
        }
      }`,
    },
  );
};

const createChoice = questionID => client.mutate(
  {
    mutation: gql`
    mutation createChoice {
      createChoice(data: {label: ""}, questionID: "${questionID}") {
        choice {
          id
          image {
            id
          }
          label
        }
      }
    }`,
  },
);

const updateChoice = (questionID, choiceID, label) => client.mutate(
  {
    mutation: gql`
    mutation updateChoice {
      updateChoice(data : {
        label: "${label}"},
        questionID: "${questionID}",
        choiceID: "${choiceID}"
      ) {
        choice {
          id
          code
          label
        }
      }
    }`,
  },
);

const deleteChoice = (questionID, choiceID) => client.mutate(
  {
    mutation: gql`
    mutation deleteChoice {
      deleteChoice(questionID: "${questionID}", choiceID: "${choiceID}") {
        success
      }
    }`,
  },
);

const createItem = questionID => client.mutate(
  {
    mutation: gql`
    mutation createItem {
      createItem(data: {label: ""}, questionID: "${questionID}") {
        item {
          id
          image {
            id
          }
          label
        }
      }
    }`,
  },
);

const updateItem = (questionID, itemID, label) => client.mutate(
  {
    mutation: gql`
    mutation updateItem {
      updateItem(data: {label: "${label}"}, questionID: "${questionID}", itemID: "${itemID}") {
        item {
          id
          image {
            id
            name
            url
            hash
          }
          label
        }
      }
    }`,
  },
);

const deleteItem = (questionID, itemID) => client.mutate(
  {
    mutation: gql`
    mutation deleteItem{
      deleteItem(itemID: "${itemID}", questionID: "${questionID}") {
        success
      }
    }`,
  },
);

const deleteQuestion = questionID => client.mutate(
  {
    mutation: gql`
    mutation deleteQuestion {
      deleteQuestion(questionID: "${questionID}") { success }
    }`,
  },
);

const createLabel = questionID => client.mutate(
  {
    mutation: gql`
    mutation createLabel {
      createLabel(
        data: {
          label: "",
          value: 0.0
        },
        questionID: "${questionID}",
      ) {
        label {
          id
          label
          value
        }
      }
    }`,
  },
);

const updateLabel = (questionID, labelID, label, value) => {
  const valueValue = parseFloat(value);

  return client.mutate(
    {
      mutation: gql`
      mutation updateLabel {
        updateLabel(
          data: {
            label: "${label}",
            value: ${valueValue},
          },
          questionID: "${questionID}",
          labelID: "${labelID}",
        ) {
          label {
            id
            label
            value
          }
        }
      }`,
    },
  );
};


const deleteLabel = (questionID, labelID) => client.mutate(
  {
    mutation: gql`
    mutation deleteLabel {
      deleteLabel(labelID: "${labelID}", questionID: "${questionID}") { success }
    }`,
  },
);

const uploadChoiceImage = (questionID, choiceID, file) => client.mutate(
  {
    mutation: gql`
    mutation uploadChoiceImage($file: Upload!) {
      updateChoice(data: { image: $file }, questionID: "${questionID}", choiceID: "${choiceID}") {
        choice {
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
    }`,
    variables: { file },
  },
);

const uploadItemImage = (questionID, itemID, file) => client.mutate(
  {
    mutation: gql`
    mutation uploadItemImage($file: Upload!) {
      updateItem(data: { image: $file }, questionID: "${questionID}", itemID: "${itemID}") {
        item {
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
      }
    }`,
    variables: { file },
  },
);

const uploadLabelImage = (questionID, labelID, file) => client.mutate(
  {
    mutation: gql`
    mutation uploadLabelImage($file: Upload!) {
      updateLabel(data: { image: $file }, questionID: "${questionID}", labelID: "${labelID}") {
        label {
          id
          value
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
    }`,
    variables: { file },
  },
);

export default {
  createQuestion,
  updateQuestion,
  updateRegulatorQuestion,
  deleteQuestion,
  createItem,
  updateItem,
  deleteItem,
  createChoice,
  updateChoice,
  deleteChoice,
  createLabel,
  updateLabel,
  deleteLabel,
  uploadChoiceImage,
  uploadItemImage,
  uploadLabelImage,
};
