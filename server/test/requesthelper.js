const config = require('../config')

const url = `http://localhost:${config.app.port}`
const request = require('supertest')(url)

const graphqlEndpoint = '/'

module.exports = {
  anon: query => new Promise(async (resolve, reject) => {
    try {
      const response = await request.post(graphqlEndpoint)
        .set('Accept', 'application/json')
        .send(query)
      const { body: { data, errors } } = response
      resolve({ data, errors })
    } catch (error) {
      reject(error)
    }
  }),
  user: (query, token) => new Promise(async (resolve, reject) => {
    try {
      const response = await request.post(graphqlEndpoint)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .send(query)
      const { body: { data, errors } } = response
      resolve({ data, errors })
    } catch (error) {
      reject(error)
    }
  }),
}
