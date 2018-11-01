

const { GraphQLServer } = require('graphql-yoga')
const { express: middleware } = require('graphql-voyager/middleware')
const { fileLoader, mergeTypes, mergeResolvers } = require('merge-graphql-schemas')
const path = require('path')

const port = 4000

const schema = fileLoader(path.join(__dirname, './entities/**/schema.graphql'))
const resolverList = fileLoader(path.join(__dirname, './entities/**/resolvers.js'))

const server = new GraphQLServer({
  typeDefs: mergeTypes(schema, { all: true }),
  resolvers: mergeResolvers(resolverList, { all: true }),
})

server.express.use('/voyager', middleware({ endpointUrl: '/' }))

server.start({ port }, () => {
  console.log(`Playground is running on http://localhost:${port}`)
  console.log(`Voyager is running on http://localhost:${port}/voyager`)
})
