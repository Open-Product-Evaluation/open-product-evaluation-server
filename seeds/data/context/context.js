const getObjectID = require('../../helper.js')

const context = [
  {
    _id: getObjectID('context1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    activeQuestion: getObjectID('question4'),
    activeSurvey: getObjectID('survey1'),
    owners: [getObjectID('user1')],
    name: 'Forum Gummersbach',
    states: [],
  },
  {
    _id: getObjectID('context2'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    activeQuestion: getObjectID('question2'),
    activeSurvey: getObjectID('survey2'),
    owners: [getObjectID('user2')],
    name: 'TH-Koeln: Gummersbach Mensa',
    states: [],
  },
]

module.exports = context
