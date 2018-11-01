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
    name: 'Forum Tablet',
    context: getObjectID('context1'),
    owners: [],
  },
  {
    _id: getObjectID('device3'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    name: 'Mensa Kiosk',
    context: getObjectID('context2'),
    owners: [],
  },
  {
    _id: getObjectID('device4'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    name: 'Mensa Tablet',
    context: getObjectID('context2'),
    owners: [getObjectID('user2')],
  },
]

module.exports = devices
