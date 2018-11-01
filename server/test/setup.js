require('dotenv').config()

const { seedDatabase } = require('mongo-seeding')
const config = require('../config')
const chai = require('chai')

chai.should()


beforeEach(async () => seedDatabase(config.seeder))

