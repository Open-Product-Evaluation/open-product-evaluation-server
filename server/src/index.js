// run dotenv (needs to run as early as possible)
require('dotenv').config()

const config = require('../config.js')
const { GraphQLServer, PubSub } = require('graphql-yoga')
const { express: middleware } = require('graphql-voyager/middleware')
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas')
const path = require('path')
const dbLoader = require('./utils/dbLoader')
const express = require('express')
const { EventEmitter } = require('events')
const AuthMiddleware = require('./utils/authMiddleware')
const AnswerStore = require('./utils/answerStore')
const ImageStore = require('./utils/imageStore')
const permissions = require('./utils/permissionMiddleware')
const pubsubEmitter = require('./utils/pubsubEmitter')

dbLoader.connectDB().then(() => {
  const eventEmitter = new EventEmitter()
  const models = dbLoader.getModels(eventEmitter)
  const authMiddleware = AuthMiddleware(models)
  const answerStore = AnswerStore(models, eventEmitter)
  const imageStore = ImageStore(eventEmitter)
  const schemaList = fileLoader(path.join(__dirname, './entities/**/*.graphql'))
  const resolverList = fileLoader(path.join(__dirname, './entities/**/*.resolvers.js'))

  const pubsub = new PubSub()
  pubsubEmitter(eventEmitter, pubsub, models)

  const server = new GraphQLServer({
    typeDefs: mergeTypes(schemaList, { all: true }),
    resolvers: mergeResolvers(resolverList, { all: true }),
    middlewares: [permissions],
    context: req => ({
      ...req,
      models,
      answerStore,
      imageStore,
      pubsub,
    }),
  })

  // set lazy CORS
  server.express.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
  })

  server.express.use(authMiddleware)
  server.express.use('/voyager', middleware({ endpointUrl: '/graphql' }))
  server.express.use('/static', express.static('static'))

  // load admin view into /admin and merge with /static
  server.express.use('/static', express.static(path.join(__dirname, '../../dist/static/')))
  server.express.use('/', (req, res, next) => {
    if (req.url === '/graphql') next()
    else {
      res.sendFile(path.join(__dirname, '../../dist/index.html'))
    }
  })

  server.start({ port: config.app.port, playground: false, endpoint: '/graphql' }, () => console.log(`Server is running on ${config.app.rootURL}:${config.app.port}`))
})
