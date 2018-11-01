const users = require('../seeds/data/user/user')
const devices = require('../seeds/data/device/device')
const contexts = require('../seeds/data/context/context')
const { seedDatabase } = require('mongo-seeding')
const config = require('../config')
const request = require('./requesthelper')
const { getSeedID } = require('./helpers')

/* Functions for Querys */

function createDeviceQuery(name) {
  return {
    query: `mutation {
        createDevice(data: {name: "TestDevice"}) {
          device {
            name
            context {
              id
            }
          }
          token
        }
      }`,
  }
}

function updateDeviceQuery(deviceID, deviceName, context, owners) {
  return {
    query: `mutation {
      updateDevice(deviceID:"${deviceID}", data:{name:"${deviceName}",context:"${context}", owners: ${JSON.stringify(owners)} }){
        device{
          id
          name
          context{
            id
          }
          owners{
            id
          }
        }
      }
    }`,
  }
}

function deleteDeviceQuery(deviceID) {
  return {
    query: `mutation {
      deleteDevice(deviceID:"${deviceID}"){
        success
      }
    }`,
  }
}

function devicesQuery() {
  return {
    query: `{
      devices {
        id
        name
        context {
          id
        }
        owners {
          id
        }
      }
    }`,
  }
}

function deviceQuery(deviceID) {
  return {
    query: `{
      device(deviceID: "${deviceID}") {
        id
        name
        context {
          id
        }
        owners{
          id
        }
      }
    }`,
  }
}

/* Tests */

describe('Device', () => {
  describe('Anonym', async () => {
    beforeAll(() => seedDatabase(config.seeder))
    it('should create a Device [Mutation]', async () => {
      const query = createDeviceQuery('TestDevie')
      const res = await request.anon(query)
      const { data, errors } = res
      expect(data.createDevice.device).toMatchSnapshot()
      expect(data.createDevice.token.length).toBeGreaterThan(0)
      expect(errors).toBeUndefined()
    })
    it.skip('should deny creation of existing Device [Mutation]', async () => {
      const query = createDeviceQuery('TestDevie')
      const res = await request.anon(query)
      const { data, errors } = res
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
  })
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
    it('should return all devices [Query]', async () => {
      const query = devicesQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return device owned by User [Query]', async () => {
      const device = devices[3]
      const query = deviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return device not owned by User [Query]', async () => {
      const device = devices[1]
      const query = deviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should create device [Mutation]', async () => {
      const query = createDeviceQuery('TestDevice')
      const res = await request.anon(query)
      const { data, errors } = res
      expect(data.createDevice.device).toMatchSnapshot()
      expect(data.createDevice.token.length).toBeGreaterThan(0)
      expect(errors).toBeUndefined()
    })
    it('should update device owned by User [Mutation]', async () => {
      const device = devices[3]
      const context = contexts[0]
      const user = users[0]
      const query = updateDeviceQuery(getSeedID(device), 'RenamedTestDevice', getSeedID(context), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should update device not owned by User [Mutation]', async () => {
      const device = devices[1]
      const context = contexts[0]
      const user = users[0]
      const query = updateDeviceQuery(getSeedID(device), 'RenamedTestDevice', getSeedID(context), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should delete device owned by user [Mutation]', async () => {
      const device = devices[3]
      const query = deleteDeviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteDevice.success).toBe(true)
    })
    it('should delete device not owned by user [Mutation]', async () => {
      const device = devices[1]
      const query = deleteDeviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteDevice.success).toBe(true)
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
    it('should return all devices [Query]', async () => {
      const query = devicesQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should return device owned by User [Query]', async () => {
      const device = devices[0]
      const query = deviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should not return device not owned by User [Query]', async () => {
      const device = devices[3]
      const query = deviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should create device [Mutation]', async () => {
      const query = createDeviceQuery('TestDevice')
      const res = await request.anon(query)
      const { data, errors } = res
      expect(data.createDevice.device).toMatchSnapshot()
      expect(data.createDevice.token.length).toBeGreaterThan(0)
      expect(errors).toBeUndefined()
    })
    it('should update device owned by User [Mutation]', async () => {
      const device = devices[0]
      const context = contexts[0]
      const user = users[0]
      const query = updateDeviceQuery(getSeedID(device), 'RenamedTestDevice', getSeedID(context), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data).toMatchSnapshot()
    })
    it('should not update device not owned by User [Mutation]', async () => {
      const device = devices[3]
      const context = contexts[0]
      const user = users[0]
      const query = updateDeviceQuery(getSeedID(device), 'RenamedTestDevice', getSeedID(context), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should delete device owned by user [Mutation]', async () => {
      const device = devices[0]
      const query = deleteDeviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(errors).toBeUndefined()
      expect(data.deleteDevice.success).toBe(true)
    })
    it('should not delete device not owned by user [Mutation]', async () => {
      const device = devices[3]
      const query = deleteDeviceQuery(getSeedID(device))
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
    it('should not return all devices [Query]', async () => {
      const query = devicesQuery()
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should not return device owned by User [Query]', async () => {
      const device = devices[0]
      const query = deviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should update device [Mutation]', async () => {
      const device = devices[0]
      const context = contexts[0]
      const user = users[0]
      const query = updateDeviceQuery(getSeedID(device), 'RenamedTestDevice', getSeedID(context), [getSeedID(user)])
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
    it('should not delete device [Mutation]', async () => {
      const device = devices[3]
      const query = deleteDeviceQuery(getSeedID(device))
      const { data, errors } = await request.user(query, jwtToken)
      expect(data).toBeNull()
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
