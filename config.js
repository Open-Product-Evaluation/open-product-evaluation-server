const path = require('path')

const determineURL = () => {
  if (process.env.HOST && process.env.HTTPS) {
    return `https://${process.env.HOST}`
  }

  if(process.env.HOST && !process.env.HTTPS) {
    return `http://${process.env.HOST}`
  }

  if(process.env.HOST === '' && process.env.HTTPS) {
    return 'https://localhost'
  }

  return 'http://localhost'
}

const socketURL = () => {
  const port = process.env.OPE_PORT || 3000
  if (process.env.HTTPS === 'true') {
    return `wss://${process.env.OPE_HOST}:${port}`
  }

  return `ws://${process.env.OPE_HOST}:${port}`
}

// prefix server settings with OPE_ to avoid naming conflicts with vue.js
module.exports = {
  app: {
    host: process.env.HOST || 'localhost',
    rootURL: determineURL(),
    socketURL: socketURL(),
    https: process.env.OPE_HTTPS === 'true' || false,
    port: parseInt(process.env.PORT, 10) || 3000,
    jwtSecret: process.env.OPE_SECRET || '1CBFA92540817289522D82D20C02A09C',
    imageRoute: '/images',
    imageFolder: path.resolve(__dirname, './static/images'),
    exportRoute: '/exports',
    clientCacheTime: 1000 * 60 * 30,
    questionCacheTime: 1000 * 60,
    playground: '/playground',
    endpoint: '/graphql',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 27017,
    name: process.env.DB_NAME || 'openproductevaluation',
  },
  seeder: {
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 27017,
      name: process.env.DB_NAME || 'openproductevaluation',
    },
    inputPath: path.resolve(__dirname, './tests/seeds/data'),
    dropDatabase: true,
  },
}
