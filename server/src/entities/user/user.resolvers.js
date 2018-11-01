const { getMatchingId, createHashFromId } = require('../../utils/idStore')
const { encodeUser, decode } = require('../../utils/authUtils')
const { ADMIN, USER } = require('../../utils/roles')
const { withFilter } = require('graphql-yoga')
const { SUB_USER } = require('../../utils/pubsubChannels')
const { saltHashPassword, comparePasswords } = require('../../utils/passwordSaltHash')


module.exports = {
  Query: {
    users: async (parent, args, { request, models }, info) => {
      try {
        const { auth } = request
        switch (auth.role) {
          case ADMIN:
            return await models.user.get({})

          case USER:
            return models.user.get({ _id: auth.user.id })

          default:
            throw new Error('Not authorized or no permissions.')
        }
      } catch (e) {
        throw e
      }
    },
    user: async (parent, { userID }, { request, models }, info) => {
      try {
        const { auth } = request
        const matchingId = getMatchingId(userID)
        switch (auth.role) {
          case ADMIN:
            return (await models.user.get({ _id: matchingId }))[0]
          case USER:
            if (matchingId === auth.id) return (await models.user.get({ _id: matchingId }))[0]
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
  Mutation: {
    createUser: async (parent, { data }, { models }, info) => {
      try {
        const updatedData = data
        updatedData.email = updatedData.email.toLowerCase()
        updatedData.passwordData = saltHashPassword(data.password)
        delete updatedData.password

        if (!(await models.user.isEmailFree(updatedData.email))) throw new Error('Email already in use. Could not create user.')

        const newUser = await models.user.insert(updatedData)
        return {
          user: newUser,
          token: encodeUser(createHashFromId(newUser.id), newUser.isAdmin),
        }
      } catch (e) {
        throw e
      }
    },
    updateUser: async (parent, { data, userID }, { request, models }, info) => {
      try {
        const { auth } = request
        const matchingId = getMatchingId(userID)

        if (auth.role === ADMIN || auth.id === matchingId) {
          const updatedData = data
          if (Object.prototype.hasOwnProperty.call(updatedData, 'email')
            && !(await models.user.isEmailFree(updatedData.email, matchingId))) throw new Error('Email already in use. Could not update user.')

          if (updatedData.password) {
            updatedData.passwordData = saltHashPassword(data.password)
            delete updatedData.password
          }

          if (Object.prototype.hasOwnProperty.call(updatedData, 'isAdmin') && auth.role !== ADMIN) throw new Error('Not authorized to upgrade user to admin status.')

          const [updatedUser] = await models.user.update({ _id: matchingId }, updatedData)
          return { user: updatedUser }
        }

        throw new Error('Not authorized or no permissions.')
      } catch (e) {
        throw e
      }
    },
    deleteUser: async (parent, { userID }, { request, models }, info) => {
      try {
        const { auth } = request
        const matchingId = getMatchingId(userID)

        if (auth.role === ADMIN || auth.id === matchingId) {
          const result = await models.user.delete({ _id: matchingId })
          return { success: result.n > 0 }
        }

        throw new Error('Not authorized or no permissions.')
      } catch (e) {
        throw e
      }
    },
    login: async (parent, { data }, { models }, info) => {
      try {
        const [user] = await models.user.get({ email: data.email.toLowerCase() })
        const { passwordData } = user
        if (!comparePasswords(data.password, passwordData.salt, passwordData.passwordHash)) { throw new Error('Email or password wrong.') }
        return {
          user,
          token: encodeUser(createHashFromId(user.id), user.isAdmin),
        }
      } catch (e) {
        throw e
      }
    },
  },
  Subscription: {
    userUpdate: {
      async subscribe(rootValue, args, context) {
        if (!context.connection.context.Authorization) throw new Error('Not authorized or no permissions.')
        const auth = decode(context.connection.context.Authorization)

        if (auth.type !== 'user'
          || (!auth.isAdmin && auth.id !== args.userID)) {
          throw new Error('Not authorized or no permissions.')
        }

        await context.models.user.get({ _id: getMatchingId(auth.id) })

        return withFilter(
          (_, __, { pubsub }) => pubsub.asyncIterator(SUB_USER),
          (payload, variables) => payload.userUpdate.user.id === getMatchingId(variables.userID),
        )(rootValue, args, context)
      },
    },
  },
  User: {
    id: async (parent, args, context, info) => createHashFromId(parent.id),
  },
}
