const authUtils = require('../../utils/authUtils')
const userModel = require('./user.model')()
const idStore = require('../../utils/idStore')
const { isUser, isAdmin, userIdIsMatching } = require('../../utils/authUtils')

module.exports = {
  Query: {
    users: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!isUser(auth)) { throw new Error('Not authorized or no permissions.') }
        if (isAdmin(auth)) return await userModel.get({})
        return await userModel.get({ _id: idStore.getMatchingId(auth.user.id) })
      } catch (e) {
        throw e
      }
    },
    user: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!userIdIsMatching(auth, args.userID)) { throw new Error('Not authorized or no permissions.') }
        return (await userModel.get({ _id: idStore.getMatchingId(args.userID) }))[0]
      } catch (e) {
        throw e
      }
    },
  },
  Mutation: {
    createUser: async (parent, args, context, info) => {
      try {
        const newUser = await userModel.insert(args.data)
        return {
          user: newUser,
          token: authUtils.encodeUser(idStore.createHashFromId(newUser.id), newUser.isAdmin),
        }
      } catch (e) {
        throw e
      }
    },
    updateUser: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!userIdIsMatching(auth, args.userID)) { throw new Error('Not authorized or no permissions.') }
        const updatedUser = await userModel.update(idStore.getMatchingId(args.userID), args.data)
        // TODO:
        //  - notify subscription
        return { user: updatedUser }
      } catch (e) {
        throw e
      }
    },
    deleteUser: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!userIdIsMatching(auth, args.userID)) { throw new Error('Not authorized or no permissions.') }
        const deletedUser = await userModel.delete(idStore.getMatchingId(args.userID))
        // TODO:
        //  - notify subscription
        return { user: deletedUser }
      } catch (e) {
        throw e
      }
    },
    login: async (parent, args, context, info) => {
      try {
        const user = (await userModel.get({ email: args.data.email }))[0]
        if (user.password !== args.data.password) { throw new Error('Email or password wrong.') }
        return {
          user,
          token: authUtils.encodeUser(idStore.createHashFromId(user.id), user.isAdmin),
        }
      } catch (e) {
        throw e
      }
    },
  },
  User: {
    id: async (parent, args, context, info) => idStore.createHashFromId(parent.id),
  },
}
