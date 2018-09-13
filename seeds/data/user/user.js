const getObjectID = require('../../helper.js')

const user = [
  {
    _id: getObjectID('user1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    firstName: 'John',
    lastName: 'Doe',
    password: '7c4a8d09ca3762af61e59520943dc26494f8941b',
    email: 'john@doe.com',
    isAdmin: false,
  },
  {
    _id: getObjectID('user2'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    firstName: 'Jane',
    lastName: 'Doe',
    password: 'dd5fef9c1c1da1394d6d34b248c51be2ad740840',
    email: 'jane@doe.com',
    isAdmin: true,
  },
  {
    _id: getObjectID('user3'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    firstName: 'Jake',
    lastName: 'Doe',
    password: 'fe605d3cac6d5698bd85e76ebfbdee18763519c7',
    email: 'jake@doe.com',
    isAdmin: true,
  },
]

module.exports = user
