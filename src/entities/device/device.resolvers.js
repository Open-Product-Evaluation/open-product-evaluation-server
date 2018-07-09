const deviceModel = require('./device.model')()
const userModel = require('../user/user.model')()
const contextModel = require('../context/context.model')()
const idStore = require('../../utils/idStore')
const { isUser, isAdmin, encodeDevice } = require('../../utils/authUtils')


module.exports = {
  Query: {
    devices: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!isUser(auth)) { throw new Error('Not authorized or no permissions.') }
        const devices = await deviceModel
          .get({ owners: { $in: idStore.getMatchingId(auth.user.id) } })
        return devices
      } catch (e) {
        throw e
      }
    },
    device: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!isUser(auth)) { throw new Error('Not authorized or no permissions.') }
        const device = (await deviceModel.get({ _id: args.deviceID }))[0]
        if (isAdmin(auth) ||
          device.owners.indexOf(idStore.getMatchingId(auth.user.id)) > -1) return device

        throw new Error('No permissions.')
      } catch (e) {
        throw e
      }
    },
  },
  Mutation: {
    createDevice: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!isUser(auth)) { throw new Error('Not authorized or no permissions.') }
        const newDevice = {
          owners: [idStore.getMatchingId(auth.user.id)],
          ...args.data,
        }
        const device = await deviceModel.insert(newDevice)
        return {
          device,
          token: encodeDevice(device.id),
        }
      } catch (e) {
        throw e
      }
    },
    updateDevice: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!isUser(auth)) { throw new Error('Not authorized or no permissions.') }
        const device = (await deviceModel.get({ _id: args.deviceID }))[0]
        if (isAdmin(auth) ||
          device.owners.indexOf(idStore.getMatchingId(auth.user.id)) > -1) {
          const newDevice = await deviceModel.update(args.deviceID, args.data)
          return { device: newDevice }
        }
        throw new Error('No permissions.')
      } catch (e) {
        throw e
      }
    },
    deleteDevice: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!isUser(auth)) { throw new Error('Not authorized or no permissions.') }
        const device = (await deviceModel.get({ _id: args.deviceID }))[0]
        if (isAdmin(auth) ||
          device.owners.indexOf(idStore.getMatchingId(auth.user.id)) > -1) {
          const deletedDevice = await deviceModel.delete(args.deviceID)
          return { device: deletedDevice }
        }
        throw new Error('No permissions.')
      } catch (e) {
        throw e
      }
    },
  },
  Device: {
    owners: async (parent, args, context, info) => userModel.get({ _id: { $in: parent.owners } }),
    context: async (parent, args, context, info) =>
      (await contextModel.get({ _id: parent.context }))[0],
  },

}
