const authUtils = require('../../utils/authUtils')

module.exports = {
  Query: {
    users: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!auth || !Object.prototype.hasOwnProperty.call(auth, 'user')) { throw new Error('Not authorized or no permissions.') }
        if (auth.user.isAdmin) return await context.db.user.get({})
        return await context.db.user.get({ _id: auth.user.id })
      } catch (e) {
        throw e
      }
    },
    user: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!auth || !Object.prototype.hasOwnProperty.call(auth, 'user') || (!auth.user.isAdmin && auth.user.id !== args.userID)) { throw new Error('Not authorized or no permissions.') }
        return (await context.db.user.get({ _id: args.userID }))[0]
      } catch (e) {
        throw e
      }
    },
  },
  Mutation: {
    createUser: async (parent, args, context, info) => {
      try {
        const newUser = await context.db.user.insert(args.data)

        return {
          user: newUser,
          token: authUtils.encodeUser(newUser.id, newUser.isAdmin),
        }
      } catch (e) {
        throw e
      }
    },
    updateUser: async (parent, args, context, info) => {
      try {
        const { auth } = context.request
        if (!auth || !Object.prototype.hasOwnProperty.call(auth, 'user') || (!auth.user.isAdmin && auth.user.id !== args.userID)) { throw new Error('Not authorized or no permissions.') }
        const updatedUser = await context.db.user.update(args.userID, args.data)
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
        if (!auth || !Object.prototype.hasOwnProperty.call(auth, 'user') || (!auth.user.isAdmin && auth.user.id !== args.userID)) { throw new Error('Not authorized or no permissions.') }
        const deletedUser = await context.db.user.delete(args.userID)
        // TODO:
        //  - notify subscription
        return { user: deletedUser }
      } catch (e) {
        throw e
      }
    },
    login: async (parent, args, context, info) => {
      try {
        const user = (await context.db.user.get({ email: args.data.email }))[0]
        if (user.password !== args.data.password) { throw new Error('Email or password wrong.') }
        return {
          user,
          token: authUtils.encodeUser(user.id, user.isAdmin),
        }
      } catch (e) {
        throw e
      }
    },
  },
}
