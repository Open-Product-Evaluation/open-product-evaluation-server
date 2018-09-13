const getObjectID = require('../../helper.js')

const vote = [
  {
    survey: getObjectID('survey1'),
    _id: getObjectID('vote1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    context: getObjectID('context1'),
    answers: [
      {
        question: getObjectID('question1'),
        type: 'CHOICE',
        choiceCode: 'A',
      },
      {
        question: getObjectID('question4'),
        type: 'LIKE',
        liked: true,
      },
      {
        question: getObjectID('question5'),
        type: 'LIKE',
        liked: null,
      },
      {
        question: getObjectID('question10'),
        type: 'REGULATOR',
        rating: 1.0,
        normalized: 0.00001123323234234234,
      },
    ],
  },
]

module.exports = vote
