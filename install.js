const { Seeder } = require('mongo-seeding')
const mongoose = require('mongoose')
const inquirer = require('inquirer')
const { createHash } = require('crypto')
const { ObjectId } = require('mongodb')
const { saltHashPassword } = require('./src/utils/password')
const chalk = require('chalk')
const shortID = require('shortid')
const fs = require('fs')

let admin = {}

let collections = [
  {
    name: 'user',
    documents: [],
  },
]

let seeding = {
  database: {},
  dropDatabase: true,
}

const questions = [
  {
    type: 'input',
    name: 'host',
    message: 'Enter the host you want OPE to run on',
    default: 'localhost'
  },
  {
    type: 'confirm',
    name: 'https',
    message: 'Do you want to use https?',
    default: false
  },
  {
    type: 'input',
    name: 'port',
    message: 'Enter the port for OPE',
    default: 3000
  },
  {
    type: 'list',
    name: 'env',
    message: 'Please select your environment:',
    choices: [
      'development',
      'test',
      'production'
    ]
  },
  {
    type: 'input',
    name: 'db_host',
    message: 'Please enter the host for your mongoDB',
    default: 'localhost'
  },
  {
    type: 'input',
    name: 'db_port',
    message: 'Please enter the port for your mongoDB',
    default: 27017
  },
  {
    type: 'input',
    name: 'db_name',
    message: 'Please enter a database name',
    default: 'openproductevaluation'
  },
  {
    type: 'input',
    name: 'email',
    message: 'What should be the email of your OPE admin account?'
  },
  {
    type: 'input',
    name: 'firstname',
    message: 'What should be the firstname of your OPE admin account?',
  },
  {
    type: 'input',
    name: 'lastname',
    message: 'What should be the lastname of your OPE admin account?',
  },
  {
    type: 'password',
    name: 'password',
    message: 'Please enter a password for your admin account'
  }
]

inquirer.prompt(questions)
  .then(answers => {

    // setup database seeding
    seeding.database.host = answers.db_host
    seeding.database.port = answers.db_port
    seeding.database.name = answers.db_name

    // setup admin account
    const hash = createHash('sha1')
      .update(answers.email, 'utf8')
      .digest('hex')
    
    admin._id = ObjectId(hash.substring(0, 24))
    admin.creationDate = new Date()
    admin.lastUpdate = new Date()
    admin.firstName = answers.firstname
    admin.lastName = answers.lastname
    admin.passwordData = saltHashPassword(answers.password)
    admin.email = answers.email
    admin.isAdmin = true

    // add admin to user collection
    collections[0].documents.push(admin)

    // check for successful mongodb connection
    checkConnection(answers.db_host, answers.db_port, answers.db_name)
      .then(() => {
        const env = {
          'HOST': answers.host,
          'OPE_HTTPS': answers.https,
          'PORT': answers.port,
          'OPE_SECRET': shortID.generate(),
          'NODE_ENV': answers.env,
          'DB_NAME': answers.db_name,
          'DB_PORT': answers.db_port,
          'DB_HOST': answers.db_host,
        }

        // try to seed database
        seed(seeding, collections).then(() => {
          let output = ''
          for(let value in env) {
            output += `${value}=${env[value]}\n`
          }

          fs.writeFile('./.env', output, (err) => {
            if(err) {
              console.log(chalk.red('Could not write .env!'))
              console.log(chalk.red('Make sure you have access and try again!'))
              process.exit(1)
            }
            process.exit()
          })
        })
      })
  })

const checkConnection = async (host, port, database) => {
  console.log(chalk.cyan('Checking mongoDB details...'))
  try {
    await mongoose.connect(`mongodb://${host}:${port}/${database}`, {useNewUrlParser: true})
    console.log(chalk.green('Connection successful!'))
  } catch (e) {
    console.log(chalk.red('Could not connect to mongoDB using your details!'))
    console.log(chalk.red('Check your settings below and try again'))
    console.log(
      JSON.stringify(
        {
          host,
          port,
          database
        },
        null,
        2
      )
    )
    process.exit(1)
  }
}

const seed = async (config, collections) => {
  try {
    const seeder = new Seeder(config)
    await seeder.import(collections)
    console.log(chalk.green('Database setup successful!'))
  } catch(e) {
    console.log(chalk.red('Database setup failed'))
    process.exit(1)
  }
}