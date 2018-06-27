const getObjectID = require('../../helper.js')

const survey = [
  {
    _id: getObjectID('survey1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    creator: getObjectID('user1'),
    title: 'Untersuchung zum Verhalten von Informatikern in Hochschulen',
    description: 'Eine wissenschaftliche Umfrage mit der Forschungsfrage: "Wie verhalten sich Informatiker?"',
    isPublic: true,
    types: [
      'CHOICE',
      'REGULATOR',
      'LIKE',
    ],
    questions: [
      getObjectID('question1'),
      getObjectID('question4'),
      getObjectID('question5'),
      getObjectID('question10'),
    ],
    votes: [
      {
        _id: getObjectID('vote1'),
        creationDate: new Date(),
        lastUpdate: new Date(),
        context: getObjectID('context1'),
        answers: [
          {
            question: getObjectID('question1'),
            choiceCode: 'A',
          },
          {
            question: getObjectID('question4'),
            liked: true,
          },
          {
            question: getObjectID('question5'),
            liked: null,
          },
          {
            question: getObjectID('question10'),
            rating: 1.0,
            normalized: 0.00001123323234234234,
          },
        ],
      },
    ],
    contexts: [
      getObjectID('context1'),
    ],
    images: [
      getObjectID('image5'),
      getObjectID('image6'),
    ],
  },
  {
    _id: getObjectID('survey2'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    creator: getObjectID('user2'),
    title: 'Öffentliche Umfrage im Rahmen des Modules "Computerethik"',
    description: 'Eine wissenschaftliche Umfrage mit der Forschungsfrage: "Künstliche Intelligenz?',
    isPublic: false,
    types: [
      'RANKING',
      'LIKE',
    ],
    questions: [
      getObjectID('question2'),
      getObjectID('question3'),
      getObjectID('question6'),
      getObjectID('question7'),
      getObjectID('question8'),
      getObjectID('question9'),
    ],
    votes: null,
    contexts: [
      getObjectID('context2'),
    ],
    images: [
      getObjectID('image1'),
      getObjectID('image2'),
      getObjectID('image5'),
      getObjectID('image6'),
    ],
  },
]

module.exports = survey
