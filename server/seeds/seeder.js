

// run dotenv (needs to run as early as possible)
require('dotenv').config()

const config = require('../config')
// eslint-disable-next-line import/no-extraneous-dependencies
const { seedDatabase } = require('mongo-seeding')

seedDatabase(config.seeder).then(() => {
  console.log('success')
}).catch((err) => {
  console.log(err)
})
