// run dotenv (needs to run as early as possible)


require('dotenv').config()

const config = require('../config.js')
const { GraphQLServer } = require('graphql-yoga')
const { express: middleware } = require('graphql-voyager/middleware')
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas')
const path = require('path')
const authMiddleware = require('./utils/authMiddleware')
const dbLoader = require('./utils/dbLoader')
const express = require('express')

dbLoader.connectDB().then(() => {
  const schemaList = fileLoader(path.join(__dirname, './entities/**/*.graphql'))
  const resolverList = fileLoader(path.join(__dirname, './entities/**/*.resolvers.js'))

  const server = new GraphQLServer({
    typeDefs: mergeTypes(schemaList, { all: true }),
    resolvers: mergeResolvers(resolverList, { all: true }),
    /* mocks: {
      DateTime: () => new Date(),
    }, */
    context: req => ({
      ...req,
    }),
  })

  server.express.use(authMiddleware)
  server.express.use('/voyager', middleware({ endpointUrl: '/' }))
  server.express.use('/public', express.static('public'))

  server.start({ port: config.app.port }, () => console.log(`Server is running on ${config.app.rootURL}:${config.app.port}`))

  const _ = require('underscore')
  console.log(_.without([1, 2, 3], ...[1, 6, 4]))
})
