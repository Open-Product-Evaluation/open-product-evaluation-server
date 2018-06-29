const getObjectID = require('../../helper.js')

const devices = [
  {
    _id: getObjectID('device1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    name: 'Forum Fernseher',
    context: getObjectID('context1'),
    owners: [getObjectID('user1')],
  },
  {
    _id: getObjectID('device2'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    name: 'Forum Fernseher #2',
    context: getObjectID('context1'),
    owners: null,
  },
]

module.exports = devices
