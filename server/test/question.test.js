const users = require('../seeds/data/user/user')
const surveys = require('../seeds/data/survey/survey')
const questions = require('../seeds/data/question/question')
const { seedDatabase } = require('mongo-seeding')
const config = require('../config')
const request = require('./requesthelper')
const { getSeedID } = require('./helpers')

/* Functions for Querys */

function createQuestionQuery(surveyID, value, description, type) {
  return {
    query: `mutation {
      createQuestion(data:{surveyID:"${surveyID}", value:"${value}", description:"${description}", type:${type}}){
        question{
          type
          items{
            image{
              name
            }
            label
          }
          value
          description
          __typename
        }
      }
    }`,
  }
}

function updateQuestionQuery(questionID, description) {
  return {
    query: `mutation {
      updateQuestion(questionID:"${questionID}", data:{description:"${description}"}){
        question {
          description
        }
      }
    }`,
  }
}

function deleteQuestionQuery(questionID) {
  return {
    query: `mutation {
      deleteQuestion(questionID: "${questionID}") {
        success
      }
    }`,
  }
}

/* Tests */

describe('Question', () => {
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
    it('should create question [Mutation]', async () => {
      const survey = surveys[1]
      const query = createQuestionQuery(getSeedID(survey), 0, 'TestDescription', 'CHOICE')
      const res = await request.user(query, jwtToken)
      const { data, errors } = res
      expect(data).toMatchSnapshot()
      expect(errors).toBeUndefined()
    })
    it('should update question of survey owned by User [Mutation]', async () => {
      const question = questions[1]
      const query = updateQuestionQuery(getSeedID(question), 'NewTestDescription')
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should update question of survey not owned by User [Mutation]', async () => {
      const question = questions[0]
      const query = updateQuestionQuery(getSeedID(question), 'NewTestDescription')
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should delete question of survey owned by user [Mutation]', async () => {
      const question = questions[1]
      const query = deleteQuestionQuery(getSeedID(question))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteQuestion.success).toBe(true)
    })
    it('should delete question of survey not owned by user [Mutation]', async () => {
      const question = questions[0]
      const query = deleteQuestionQuery(getSeedID(question))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteQuestion.success).toBe(true)
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
    it('should create question [Mutation]', async () => {
      const survey = surveys[0]
      const query = createQuestionQuery(getSeedID(survey), 4, 'TestDescription', 'CHOICE')
      const res = await request.user(query, jwtToken)
      const { data, errors } = res
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should update question of survey owned by User [Mutation]', async () => {
      const question = questions[0]
      const query = updateQuestionQuery(getSeedID(question), 'NewTestDescription')
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should not update question of survey not owned by User [Mutation]', async () => {
      const question = questions[8]
      const query = updateQuestionQuery(getSeedID(question), 'NewTestDescription')
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should delete question of survey owned by user [Mutation]', async () => {
      const question = questions[0]
      const query = deleteQuestionQuery(getSeedID(question))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteQuestion.success).toBe(true)
    })
    it('should not delete question of survey not owned by user [Mutation]', async () => {
      const question = questions[8]
      const query = deleteQuestionQuery(getSeedID(question))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
  })
  describe.skip('Device', async () => {
    // TODO Not testable without device login function
    let jwtToken = ''
    beforeAll(async () => {
      await seedDatabase(config.seeder)
      const query = {
        query: `mutation{createDevice(data:{name:"TestDevice"}){
          token
       }}`,
      }
      const { data, errors } = await request.anon(query)
      data.createDevice.token.should.be.a('string')
      expect(errors).toBeUndefined()
      const { createDevice: { token } } = data
      jwtToken = token
    })
    it('should not delete device [Mutation]', async () => {
      const device = questions[3]
      const query = deleteQuestionQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
