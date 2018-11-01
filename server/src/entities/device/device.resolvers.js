const { getMatchingId, createHashFromId } = require('../../utils/idStore')
const { encodeDevice, decode } = require('../../utils/authUtils')
const { ADMIN, USER, DEVICE } = require('../../utils/roles')
const { withFilter } = require('graphql-yoga')
const { SUB_DEVICE } = require('../../utils/pubsubChannels')

const keyExists = (object, keyName) =>
  Object.prototype.hasOwnProperty.call(object.toObject(), keyName)

module.exports = {
  Query: {
    devices: async (parent, args, { request, models }, info) => {
      try {
        const { auth } = request
        switch (auth.role) {
          case ADMIN:
            return await models.device.get()

          case USER:
            return await models.device.get() // { owners: { $in: auth.id } })

          case DEVICE:
            if (keyExists(auth.device, 'context')
            && auth.device.context !== null
            && auth.device.context !== '') return await models.device.get({ context: auth.device.context })
            return [auth.device]

          default:
            throw new Error('Not authorized or no permissions.')
        }
      } catch (e) {
        throw e
      }
    },
    device: async (parent, { deviceID }, { request, models }, info) => {
      try {
        const { auth } = request
        const [device] = await models.device.get({ _id: getMatchingId(deviceID) })

        switch (auth.role) {
          case ADMIN:
            return device

          case USER:
            if (device.owners.indexOf(auth.id) > -1) return device
            break

          case DEVICE:
            if (device.id === auth.id) return device
            break

          default:
            throw new Error('No permissions.')
        }
        throw new Error('No permissions.')
      } catch (e) {
        throw e
      }
    },
  },
  Mutation: {
    createDevice: async (parent, { deviceID, data }, { request, models }, info) => {
      try {
        const { auth } = request
        const newDevice = (auth && auth.role === USER) ? {
          owners: [auth.user.id],
          ...data,
        } : data
        const device = await models.device.insert(newDevice)
        return {
          device,
          token: encodeDevice(createHashFromId(device.id)),
        }
      } catch (e) {
        throw e
      }
    },
    updateDevice: async (parent, { deviceID, data }, { request, models }, info) => {
      const matchingDeviceId = getMatchingId(deviceID)

      async function updateDevice() {
        const inputData = data
        if (inputData.context) {
          inputData.context = getMatchingId(inputData.context)
          await models.context.get({ _id: inputData.context })
        }

        if (inputData.owners) {
          inputData.owners = inputData.owners.map(owner => getMatchingId(owner))
          const users = await models.user.get({ _id: { $in: inputData.owners } })
          if (inputData.owners.length !== users.length) throw new Error('Not all owners where found.')
        }

        const [newDevice] = await models.device
          .update({ _id: matchingDeviceId }, inputData)

        return { device: newDevice }
      }

      try {
        const { auth } = request

        const [device] = await models.device.get({ _id: matchingDeviceId })

        switch (auth.role) {
          case ADMIN:
            return updateDevice()

          case USER:
            if (device.owners.indexOf(auth.user.id) > -1) return updateDevice()
            break

          case DEVICE:
            if (auth.id === device.id) return updateDevice()
            break

          default:
            throw new Error('Not authorized or no permissions.')
        }
        throw new Error('Not authorized or no permissions.')
      } catch (e) {
        throw e
      }
    },
    deleteDevice: async (parent, { deviceID }, { request, models }, info) => {
      const matchingId = getMatchingId(deviceID)

      async function deleteDevice() {
        await models.device.delete({ _id: matchingId })
        return { success: true }
      }

      try {
        const { auth } = request
        const [device] = await models.device.get({ _id: matchingId })
        switch (auth.role) {
          case ADMIN:
            return deleteDevice()

          case USER:
            if (device.owners.indexOf(auth.user.id) > -1) return deleteDevice()
            break

          case DEVICE:
            if (auth.id === device.id) return deleteDevice()
            break

          default:
            throw new Error('Not authorized or no permissions.')
        }
        throw new Error('Not authorized or no permissions.')
      } catch (e) {
        throw e
      }
    },
  },
  Subscription: {
    deviceUpdate: {
      async subscribe(rootValue, args, context) {
        if (!context.connection.context.Authorization) throw new Error('Not authorized or no permissions.')
        const auth = decode(context.connection.context.Authorization)
        const matchingDeviceId = getMatchingId(args.deviceID)
        const [desiredDevice] = await context.models.device.get({ _id: matchingDeviceId })

        switch (auth.type) {
          case 'user': {
            if (!auth.isAdmin) {
              const matchingUserId = getMatchingId(auth.id)
              if (!desiredDevice.owners.includes(matchingUserId)) throw new Error('Not authorized or no permissions.')
            }
            break
          }

          case 'device': {
            const matchingAuthDeviceId = getMatchingId(auth.id)

            if (matchingDeviceId === matchingAuthDeviceId) break

            if (!desiredDevice.context) throw new Error('Not authorized or no permissions.')

            const devicesOfContextOfDesiredDevice =
              await context.models.device.get({ context: desiredDevice.context })
            const deviceIds = devicesOfContextOfDesiredDevice.map(device => device.id)

            if (!deviceIds.includes(matchingAuthDeviceId)) throw new Error('Not authorized or no permissions.')
            break
          }

          default: throw new Error('Not authorized or no permissions.')
        }

        return withFilter(
          (__, ___, { pubsub }) => pubsub.asyncIterator(SUB_DEVICE),
          (payload, variables) =>
            payload.deviceUpdate.device.id === getMatchingId(variables.deviceID),
        )(rootValue, args, context)
      },
    },
  },
  Device: {
    id: async (parent, args, context, info) => createHashFromId(parent.id),
    owners: async (parent, args, { models, request }, info) => {
      const { auth } = request
      if (!keyExists(parent, 'owners') || parent.owners === null || parent.owners.length === 0) return null
      switch (auth.role) {
        case ADMIN:
          return models.user.get({ _id: { $in: parent.owners } })

        case USER:
          if (parent.owners.indexOf(auth.user.id) > -1) {
            return models.user.get({ _id: { $in: parent.owners } })
          }
          break

        default:
          throw new Error('Not authorized or no permissions.')
      }
      throw new Error('Not authorized or no permissions.')
    },
    context: async (parent, args, { models }, info) => {
      if (!keyExists(parent, 'context') || parent.context === null || parent.context === '') return null
      return (await models.context.get({ _id: parent.context }))[0]
    },
  },

}
