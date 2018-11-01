const users = require('../seeds/data/user/user')
const surveys = require('../seeds/data/survey/survey')
const questions = require('../seeds/data/question/question')
const contexts = require('../seeds/data/context/context')
const devices = require('../seeds/data/device/device')
const { seedDatabase } = require('mongo-seeding')
const config = require('../config')
const request = require('./requesthelper')
const { getSeedID, getDeviceToken } = require('./helpers')

/* Functions for Querys */

function createContextQuery(name) {
  return {
    query: `mutation {
      createContext(data: {name: "${name}"}) {
        context {
          name
          activeQuestion{
            description
          }
          activeSurvey{
            title
          }
          owners {
            email
          }
          devices {
            name
          }
          states {
            key
          }
        }
      }
    }`,
  }
}

function updateContextQuery(contextID, contextName, activeQuestion, activeSurvey, owners) {
  return {
    query: `mutation {
      updateContext(contextID: "${contextID}", data: {name: "${contextName}", activeQuestion: "${activeQuestion}", activeSurvey: "${activeSurvey}", owners: ${JSON.stringify(owners)}}) {
        context {
          name
          activeQuestion{
            description
          }
          activeSurvey{
            title
          }
          owners {
            email
          }
          devices {
            name
          }
          states {
            key
          }
        }
      }
    }`,
  }
}

function deleteContextQuery(contextID) {
  return {
    query: `mutation {
      deleteContext(contextID: "${contextID}") {
        success
      }
    }`,
  }
}

function contextsQuery() {
  return {
    query: `{
      contexts {
        name
        activeQuestion{
          description
        }
        activeSurvey{
          title
        }
        owners {
          email
        }
        devices {
          name
        }
        states {
          key
        }
      }
    }
    `,
  }
}

function contextQuery(contextID) {
  return {
    query: `{
      context(contextID: "${contextID}") {
        name
        activeQuestion{
          description
        }
        activeSurvey{
          title
        }
        owners {
          email
        }
        devices {
          name
        }
        states {
          key
        }
      }
    }`,
  }
}

/* Tests */

describe('Context', () => {
  describe('Admin', async () => {
    let jwtToken = ''
    beforeAll(async () => {
      await seedDatabase(config.seeder)
      const expected = users[1]
      const query = {
        query: `mutation {
          login(data: {email: "${expected.email}", password: "password"}) {
            token
            user {
              id
              firstName
              lastName
              email
            }
          }
        }`,
      }
      const { data, errors } = await request.anon(query)
      data.login.token.should.be.a('string')
      expect(errors).toBeUndefined()
      const { login: { token } } = data
      jwtToken = token
    })
    it('should return all contexts [Query]', async () => {
      const query = contextsQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return context owned by User [Query]', async () => {
      const context = contexts[0]
      const query = contextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return context not owned by User [Query]', async () => {
      const context = contexts[1]
      const query = contextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should create context [Mutation]', async () => {
      const query = createContextQuery('TestContext')
      const res = await request.user(query, jwtToken)
      const { data, errors } = res
      expect(data).toMatchSnapshot()
      expect(errors).toBeUndefined()
    })
    it('should update context owned by User [Mutation]', async () => {
      const context = contexts[1]
      const question = questions[0]
      const survey = surveys[0]
      const user = users[0]
      const query = updateContextQuery(getSeedID(context), 'RenamedTestContext', getSeedID(question), getSeedID(survey), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should update context not owned by User [Mutation]', async () => {
      const context = contexts[0]
      const question = questions[0]
      const survey = surveys[0]
      const user = users[0]
      const query = updateContextQuery(getSeedID(context), 'RenamedTestContext', getSeedID(question), getSeedID(survey), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should delete context owned by user [Mutation]', async () => {
      const context = contexts[0]
      const query = deleteContextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteContext.success).toBe(true)
    })
    it('should delete context not owned by user [Mutation]', async () => {
      const context = contexts[1]
      const query = deleteContextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteContext.success).toBe(true)
    })
  })
  describe('User', async () => {
    let jwtToken = ''
    beforeAll(async () => {
      await seedDatabase(config.seeder)
      const expected = users[0]
      const query = {
        query: `mutation {
          login(data: {email: "${expected.email}", password: "password"}) {
            token
            user {
              id
              firstName
              lastName
              email
            }
          }
        }`,
      }
      const { data, errors } = await request.anon(query)
      data.login.token.should.be.a('string')
      expect(errors).toBeUndefined()
      const { login: { token } } = data
      jwtToken = token
    })
    it('should return all contexts [Query]', async () => {
      const query = contextsQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return context owned by User [Query]', async () => {
      const context = contexts[0]
      const query = contextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return context not owned by User [Query]', async () => {
      const context = contexts[1]
      const query = contextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors.length).toBe(1)
      expect(errors[0].path).toEqual(['context', 'owners'])
      expect(data).toMatchSnapshot()
    })
    it('should create context [Mutation]', async () => {
      const query = createContextQuery('TestContext')
      const res = await request.user(query, jwtToken)
      const { data, errors } = res
      expect(data).toMatchSnapshot()
      expect(errors).toBeUndefined()
    })
    it('should update context owned by User [Mutation]', async () => {
      const context = contexts[0]
      const question = questions[0]
      const survey = surveys[0]
      const user = users[0]
      const query = updateContextQuery(getSeedID(context), 'RenamedTestContext', getSeedID(question), getSeedID(survey), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should not update context not owned by User [Mutation]', async () => {
      const context = contexts[1]
      const question = questions[0]
      const survey = surveys[0]
      const user = users[0]
      const query = updateContextQuery(getSeedID(context), 'RenamedTestContext', getSeedID(question), getSeedID(survey), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should delete context owned by user [Mutation]', async () => {
      const context = contexts[0]
      const query = deleteContextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteContext.success).toBe(true)
    })
    it('should not delete context not owned by user [Mutation]', async () => {
      const context = contexts[1]
      const query = deleteContextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
  })
  describe('Device', async () => {
    let jwtToken = ''
    beforeAll(async () => {
      await seedDatabase(config.seeder)
      const device = devices[1]
      jwtToken = getDeviceToken(device)
    })
    it('should return contexts assigned to [Query]', async () => {
      const query = contextsQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors[0].path).toEqual(['contexts', 0, 'owners'])
      expect(data).toMatchSnapshot()
    })
    it('should return context [Query]', async () => {
      const context = contexts[0]
      const query = contextQuery(getSeedID(context))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors[0].path).toEqual(['context', 'owners'])
      expect(data).toMatchSnapshot()
    })
  })
})
