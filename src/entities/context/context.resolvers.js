const { getMatchingId, createHashFromId } = require('../../utils/idStore')
const _ = require('underscore')
const { ADMIN, USER, DEVICE } = require('../../utils/roles')
const { decode } = require('../../utils/authUtils')
const { withFilter } = require('graphql-yoga')
const { SUB_CONTEXT } = require('../../utils/pubsubChannels')

const hasStatePremissions = async (auth, data, args, models) => {
  const [surveyContext] = await models.context.get({ _id: getMatchingId(args.contextID) })
  if (!(auth.role === DEVICE || auth.role === ADMIN || (auth.role === USER && (surveyContext.owners
    .indexOf(auth.user.id) > -1)))) { return false }
  if (auth.role === DEVICE) {
    if (!Object.prototype.hasOwnProperty.call(auth.device.toObject(), 'context')
      || auth.device.context === null
      || auth.device.context === ''
      || surveyContext.id !== auth.device.context) { return false }
  }
  return true
}

const getFilteredContexts = async (contexts, types, models) => {
  try {
    const surveyIds = contexts.reduce((acc, foundContext) => ((foundContext.activeSurvey && foundContext.activeSurvey !== '')
      ? [...acc, foundContext.activeSurvey] : acc), [])

    const matchingSurveys = await models.survey.get({
      _id: { $in: surveyIds },
      $and: [
        { types: { $all: types } },
        { types: { $size: types.length } },
      ],
    })

    const matchingIds = matchingSurveys.map(survey => survey.id)

    return contexts.reduce((acc, context) => ((matchingIds
      .indexOf(context.activeSurvey) > -1) ? [...acc, context] : acc), [])
  } catch (e) {
    throw new Error('No matching context found.')
  }
}

const filterContextsIfTypesWereProvided = async (args, contexts, models) => {
  let filteredContexts = contexts
  if (args.types && args.types !== null && args.types.length > 0) {
    filteredContexts = await getFilteredContexts(contexts, _.uniq(args.types), models)
  }
  return filteredContexts
}

const getContextsForDevice = async (models) => {
  try {
    const allowedSurveyIds = (await models.survey.get({ isPublic: true }))
    return await models.context
      .get({ activeSurvey: { $in: allowedSurveyIds } })
  } catch (e) {
    throw new Error('No public context found.')
  }
}

const getContextsForUser = async (auth, models) => {
  if (auth.role === ADMIN) {
    return models.context.get()
  }
  return models.context.get({ owners: auth.user.id })
}

const keyExists = (object, keyName) =>
  Object.prototype.hasOwnProperty.call(object.toObject(), keyName)

module.exports = {
  Query: {
    contexts: async (parent, args, { request, models }, info) => {
      try {
        const { auth } = request
        switch (auth.role) {
          case DEVICE: {
            const contexts = await getContextsForDevice(models)
            return filterContextsIfTypesWereProvided(args, contexts)
          }
          case USER: {
            const contexts = await getContextsForUser(auth, models)
            return filterContextsIfTypesWereProvided(args, contexts)
          }
          case ADMIN: {
            const contexts = await models.context.get()
            return filterContextsIfTypesWereProvided(args, contexts, models)
          }
          default:
            throw new Error('Not authorized or no permissions.')
        }
      } catch (e) {
        throw e
      }
    },
    context: async (parent, args, { models }, info) => {
      try {
        const [surveyContext] = await models
          .context.get({ _id: getMatchingId(args.contextID) })
        return surveyContext
      } catch (e) {
        throw e
      }
    },
    state: async (parent, args, { request, models }, info) => {
      try {
        const { auth } = request
        const [surveyContext] = await models.context
          .get({ _id: getMatchingId(args.contextID) })
        const foundState = surveyContext.states.find(state => state.key === args.key)

        switch (auth.roles) {
          case ADMIN: {
            if (!foundState) throw new Error('No State found.')
            return foundState
          }

          case USER: {
            if (surveyContext.owners.indexOf(auth.user.id) > -1) {
              if (!foundState) throw new Error('No State found.')
              return foundState
            }
            break
          }

          case DEVICE: {
            if ((Object.prototype.hasOwnProperty.call(auth.device.toObject(), 'context')
            && auth.device.context !== null
            && auth.device.context !== ''
            && surveyContext.id === auth.device.context)) {
              if (!foundState) throw new Error('No State found.')
              return foundState
            }
            break
          }
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
    createContext: async (parent, args, { models, request }, info) => {
      try {
        const { auth } = request
        const newContext = {
          owners: [auth.id],
          ...args.data,
        }
        const insertedContext = (await models.context.insert(newContext))
        return {
          context: insertedContext,
        }
      } catch (e) {
        throw e
      }
    },
    updateContext: async (parent, { data, contextID }, { models, request }, info) => {
      try {
        const { auth } = request

        const [contextFromID] = await models.context
          .get({ _id: getMatchingId(contextID) })

        if (auth.role === ADMIN || contextFromID.owners.indexOf(auth.id) > -1) {
          const inputData = data

          if (inputData.activeSurvey) {
            inputData.activeSurvey = getMatchingId(inputData.activeSurvey)
            await models.survey.get({ _id: inputData.activeSurvey })
          }

          if (inputData.activeQuestion) {
            inputData.activeQuestion = getMatchingId(inputData.activeQuestion)
            await models.question.get({ _id: inputData.activeQuestion })
          }

          if (inputData.owners) {
            inputData.owners = inputData.owners.map(owner => getMatchingId(owner))
            const users = await models.user.get({ _id: { $in: inputData.owners } })
            if (inputData.owners.length !== users.length) throw new Error('Not all owners where found.')
          }

          const [newContext] = await models.context
            .update({ _id: getMatchingId(contextID) }, inputData)
          return { context: newContext }
        }
        throw new Error('Not authorized or no permissions.')
      } catch (e) {
        throw e
      }
    },
    deleteContext: async (parent, { contextID }, { models, request }, info) => {
      try {
        const { auth } = request
        const [contextFromID] = await models.context
          .get({ _id: getMatchingId(contextID) })

        if (auth.role === ADMIN || contextFromID.owners.indexOf(auth.id) > -1) {
          await models.context.delete({ _id: getMatchingId(contextID) })
          return { success: true }
        }

        throw new Error('Not authorized or no permissions.')
      } catch (e) {
        throw e
      }
    },
    createState: async (parent, args, { models, request }, info) => {
      try {
        const { auth } = request
        const { data } = args

        const hasAccess = await hasStatePremissions(auth, data, args, models)

        if (!hasAccess) { throw new Error('Not authorized or no permissions.') }
        const newState = await models.context
          .insertState(getMatchingId(args.contextID), data.key, data.value)
        return { state: newState }
      } catch (e) {
        throw e
      }
    },
    updateState: async (parent, args, { models, request }, info) => {
      try {
        const { auth } = request
        const { data } = args

        const hasAccess = await hasStatePremissions(auth, data, args, models)

        if (!hasAccess) { throw new Error('Not authorized or no permissions.') }

        const newState = await models.context
          .updateState(getMatchingId(args.contextID), data.key, data.value)
        return { state: newState }
      } catch (e) {
        throw e
      }
    },
    deleteState: async (parent, args, { models, request }, info) => {
      try {
        const { auth } = request
        const { data } = args

        const hasAccess = await hasStatePremissions(auth, data, args, models)

        if (!hasAccess) { throw new Error('Not authorized or no permissions.') }

        await models.context.deleteState(getMatchingId(args.contextID), data.key)

        return { success: true }
      } catch (e) {
        throw e
      }
    },
  },
  Subscription: {
    contextUpdate: {
      async subscribe(rootValue, args, context) {
        if (!context.connection.context.Authorization) throw new Error('Not authorized or no permissions.')
        const auth = decode(context.connection.context.Authorization)
        const matchingContextId = getMatchingId(args.contextID)
        const [desiredContext] = await context.models.context.get({ _id: matchingContextId })

        switch (auth.type) {
          case 'user': {
            if (!auth.isAdmin) {
              const matchingUserId = getMatchingId(auth.id)
              if (!desiredContext.owners.includes(matchingUserId)) throw new Error('Not authorized or no permissions.')
            }
            break
          }

          case 'device': {
            const matchingDeviceId = getMatchingId(auth.id)
            const devicesOfContext = await context.models.device.get({ context: matchingContextId })
            const deviceIds = devicesOfContext.map(device => device.id)

            if (!deviceIds.includes(matchingDeviceId)) throw new Error('Not authorized or no permissions.')
            break
          }

          default: throw new Error('Not authorized or no permissions.')
        }

        return withFilter(
          (__, ___, { pubsub }) => pubsub.asyncIterator(SUB_CONTEXT),
          (payload, variables) =>
            payload.contextUpdate.context.id === getMatchingId(variables.contextID),
        )(rootValue, args, context)
      },
    },
  },
  Context: {
    owners: async (parent, args, { request, models }, info) => {
      if (!keyExists(parent, 'owners') || parent.owners === null || parent.owners.length === 0) return null
      const { auth } = request
      const [surveyContext] = await models.context.get({ _id: parent.id })
      switch (auth.role) {
        case ADMIN:
          return models.user.get({ _id: { $in: parent.owners } })

        case USER:
          if (!(surveyContext.owners.indexOf(auth.id) > -1)) throw new Error('Not authorized or no permissions.')
          return models.user.get({ _id: { $in: parent.owners } })

        default:
          throw new Error('Not authorized or no permissions.')
      }
    },
    devices: async (parent, args, { models }, info) => {
      const devices = await models.device.get({ context: parent.id })
      return (devices.length === 0) ? null : devices
    },
    activeSurvey: async (parent, args, { models }, info) => {
      if (!keyExists(parent, 'activeSurvey') || parent.activeSurvey === null || parent.activeSurvey === '') return null
      return (await models.survey.get({ _id: parent.activeSurvey }))[0]
    },
    activeQuestion: async (parent, args, { models }, info) => {
      if (!keyExists(parent, 'activeQuestion') || parent.activeQuestion === null || parent.activeQuestion === '') return null
      return (await models.question.get({ _id: parent.activeQuestion }))[0]
    },
    states: async (parent, args, context, info) => {
      if (!keyExists(parent, 'states') || parent.states === null || parent.states.length === 0) return null
      return parent.states
    },
    id: async (parent, args, context, info) => createHashFromId(parent.id),
  },
}
