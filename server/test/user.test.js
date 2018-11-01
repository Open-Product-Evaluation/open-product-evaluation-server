
const users = require('../seeds/data/user/user')
const { seedDatabase } = require('mongo-seeding')
const config = require('../config')
const request = require('./requesthelper')
const { getSeedID } = require('./helpers')

/* Functions for Querys */

function updateUserQuery(userID) {
  return {
    query: `mutation {
      updateUser(data:{firstName:"Test1", lastName:"Test2", email:"test@test.com", password:"password1"}, userID:"${userID}"){
        user {
          firstName
          lastName
          email
        }
      }
    }`,
  }
}

function deleteUserQuery(userID) {
  return {
    query: `mutation {
      deleteUser(userID:"${userID}"){
        success
      }
    }`,
  }
}

function usersQuery() {
  return {
    query: `{
      users {
        firstName
        lastName
        email
      }
    }`,
  }
}

function userQuery(userID) {
  return {
    query: `{ user(userID: "${userID}") {
      firstName
      lastName
      email
      }
    }`,
  }
}

/* Tests */

describe('User', () => {
  describe('Anonym', async () => {
    it('should create a User [Mutation]', async () => {
      const query = {
        query: `mutation {
          createUser(data:{firstName:"Max", lastName:"Mustermann", email:"max@mustermann.de", password:"uShallNotPass"}){
            user{
              firstName
              lastName
              email
            }
            token
          }}`,
      }
      const res = await request.anon(query)
      const { data, errors } = res
      expect(data.createUser.user).toMatchSnapshot()
      expect(data.createUser.token.length).toBeGreaterThan(0)
      expect(errors).toBeUndefined()
    })
    it('should deny creation of existing User [Mutation]', async () => {
      const user = users[2]
      const query = {
        query: `mutation {
          createUser(data:{firstName:"Max", lastName:"Mustermann", email:"${user.email}", password:"${user.password}"}){
            user{
              firstName
              lastName
              email
            }
            token
          }}`,
      }
      const res = await request.anon(query)
      const { data, errors } = res
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should deny login of an invalid User [Mutation]', async () => {
      const query = {
        query: `mutation {
          login(data: {email: "fake@fake.com", password: "geheim1234"}) {
            token
          }
        }`,
      }
      const res = await request.anon(query)
      const { data, errors } = res
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should login a valid User [Mutation]', async () => {
      const expected = users[2]

      const query = {
        query: `mutation {
          login(data: {email: "${expected.email}", password: "password"}) {
            token
            user {
              firstName
              lastName
              email
            }
          }
        }`,
      }

      const res = await request.anon(query)
      const { data, errors } = res
      const { login: { user } } = data
      data.login.token.should.be.a('string')
      expect(user).toMatchSnapshot()
      expect(errors).toBeUndefined()
    })
  })
  describe('Admin', async () => {
    let jwtToken = ''
    let userID = ''
    beforeAll(async () => {
      await seedDatabase(config.seeder)
      const expected = users[2]
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
      const { login: { user } } = data
      data.login.token.should.be.a('string')
      expect(errors).toBeUndefined()
      const { login: { token } } = data
      jwtToken = token
      userID = user.id
    })
    it('should update own user data [Mutation]', async () => {
      const query = updateUserQuery(userID)
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should update other user data [Mutation]', async () => {
      const user = users[0]
      const query = updateUserQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return all users [Query]', async () => {
      const query = usersQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return other user [Query]', async () => {
      const user = users[0]
      const query = userQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should delete other user [Mutation]', async () => {
      const user = users[0]
      const query = deleteUserQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteUser.success).toBe(true)
    })
    it('should delete own user [Mutation]', async () => {
      const query = deleteUserQuery(userID)
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteUser.success).toBe(true)
    })
  })
  describe('User', async () => {
    let jwtToken = ''
    let userID = ''
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
      const { login: { user } } = data
      data.login.token.should.be.a('string')
      expect(errors).toBeUndefined()
      const { login: { token } } = data
      jwtToken = token
      userID = user.id
    })
    it('should update own user data [Mutation]', async () => {
      const query = updateUserQuery(userID)
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should not update other user data [Mutation]', async () => {
      const user = users[2]
      const query = updateUserQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should return only own user [Query]', async () => {
      const query = usersQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should not return other user [Query]', async () => {
      const user = users[2]
      const query = userQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should delete own user [Mutation]', async () => {
      const query = deleteUserQuery(userID)
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteUser.success).toBe(true)
    })
    it('should not delete other user [Mutation]', async () => {
      const user = users[2]
      const query = deleteUserQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
  })
  describe('Device', async () => {
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
    it('should not update other user data [Mutation]', async () => {
      const user = users[2]
      const query = updateUserQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should not return users [Query]', async () => {
      const query = usersQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should not return other user [Query]', async () => {
      const user = users[2]
      const query = userQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should not delete other user [Mutation]', async () => {
      const user = users[2]
      const query = deleteUserQuery(getSeedID(user))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
