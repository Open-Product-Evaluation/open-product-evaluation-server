const getObjectID = require('../../helper.js')

const survey = [
  {
    _id: getObjectID('survey1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    creator: getObjectID('user1'),
    title: 'Untersuchung zum Verhalten von Informatikern in Hochschulen',
    description: 'Eine wissenschaftliche Umfrage mit der Forschungsfrage: "Wie verhalten sich Informatiker?',
    isPublic: true,
    types: ['CHOICE', 'REGULATOR', 'LIKE'],
    questions: [
      getObjectID('question1'),
      getObjectID('question4'),
      getObjectID('question5'),
      getObjectID('question10')
    ],
    votes: [
      getObjectID('vote1')
    ],
    contexts: [
      getObjectID('context1')
    ],
    images: [
      getObjectID('image5'),
      getObjectID('image6')
    ]
  },
  {
    _id: getObjectID('survey2'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    creator: getObjectID('user2'),
    title: 'Öffentliche Umfrage im Rahmen des Modules "Computerethik"',
    description: 'Eine wissenschaftliche Umfrage mit der Forschungsfrage: "Künstliche Intelligenz?',
    isPublic: false,
    types: ['RANKING', 'LIKE'],
    questions: [
      getObjectID('question2'),
      getObjectID('question3'),
      getObjectID('question6'),
      getObjectID('question7'),
      getObjectID('question8'),
      getObjectID('question9')
    ],
    votes: [],
    contexts: [
      getObjectID('context2')
    ],
    images: []
  }
]

module.exports = survey