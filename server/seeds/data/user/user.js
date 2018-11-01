const getObjectID = require('../../helper.js')

const user = [
  {
    _id: getObjectID('user1'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    firstName: 'John',
    lastName: 'Doe',
    passwordData: {
      salt: '531049bd93c9841c',
      passwordHash: '2059afbceab6ff0a61cff44737a486765da85266dfa4ed6c2b0cc26de378185ea31be69822973524e5562b00cad7bbffd5cdab6ee2c20f3d23eb252f24db464e',
    },
    email: 'john@doe.com',
    isAdmin: false,
  },
  {
    _id: getObjectID('user2'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    firstName: 'Jane',
    lastName: 'Doe',
    passwordData: {
      salt: '1425a1e0701552c8',
      passwordHash: '350810e5a42912ddc2961afeb7837f187b9bd4fa17c82c2b7432711750ec3374b29fb410d362d18d343df8cff53df99eeabaec0770d63bf5b6c24d5f90d2ab5e',
    },
    email: 'jane@doe.com',
    isAdmin: true,
  },
  {
    _id: getObjectID('user3'),
    creationDate: new Date(),
    lastUpdate: new Date(),
    firstName: 'Jake',
    lastName: 'Doe',
    passwordData: {
      salt: 'b9c91eba254797fd',
      passwordHash: '50036542ba68763a319740ebcd86a8595ca68d03c9e2d2ad2328996bdbeeb29726f6d9670eee4f3361896db0da026a2274ae21baa9f58431a0571905c31dd3f7',
    },
    email: 'jake@doe.com',
    isAdmin: true,
  },
]

module.exports = user
