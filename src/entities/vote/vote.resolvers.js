const { getMatchingId, createHashFromId } = require('../../utils/idStore')
const { ADMIN, USER, DEVICE } = require('../../utils/roles')
const { decode } = require('../../utils/authUtils')
const { withFilter } = require('graphql-yoga')
const { SUB_ANSWERS, SUB_VOTES } = require('../../utils/pubsubChannels')

const sharedResolvers = {
  question: async (parent, args, context, info) => createHashFromId(parent.question),
}

const getDeviceDependencies = async (auth, models) => {
  if (!(auth.role === DEVICE)) throw new Error('Not authorized or no permissions.')
  const { device } = auth

  if (!(Object.prototype.hasOwnProperty.call(device.toObject(), 'context')
    && device.context !== null && device.context !== '')) throw new Error('This Device is not connected to a Context.')
  const [context] = await models.context.get({ _id: device.context })

  if (!(Object.prototype.hasOwnProperty.call(context.toObject(), 'activeSurvey')
    && context.activeSurvey !== null && context.activeSurvey !== '')) throw new Error('The Context of this Device is not connected to a Survey.')
  const [survey] = await models.survey.get({ _id: context.activeSurvey })

  return {
    device,
    context,
    survey,
  }
}

const deviceIsAllowedToSeeVote = async (device, survey, models) => {
  if (Object.prototype.hasOwnProperty.call(device.toObject(), 'context')
    && device.context !== null && device.context !== '') {
    const contextIds = (await models.context.get({ activeSurvey: survey.id }))
      .reduce((acc, context) => [...acc, context.id], [])

    return contextIds.indexOf(device.context) > -1
  } return false
}

module.exports = {
  Query: {
    votes: async (parent, { surveyID }, { request, models }, info) => {
      try {
        const { auth } = request
        const [survey] = await models.survey.get({ _id: getMatchingId(surveyID) })

        switch (auth.role) {
          case ADMIN:
            return models.vote.get({ survey: survey.id })

          case USER:
            if (survey.creator === auth.id) return models.vote.get({ survey: survey.id })
            break

          case DEVICE:
            if (await deviceIsAllowedToSeeVote(auth.device, survey, models)) {
              return models.vote.get({ survey: survey.id })
            }
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
    createAnswer: async (parent, { data }, { request, answerStore, models }, info) => {
      try {
        if (Object.keys(data).length !== 2) throw new Error('Illegal amount of arguments.')
        const { auth } = request
        const deviceDependencies = await getDeviceDependencies(auth, models)
        const inputData = data
        inputData.question = getMatchingId(inputData.questionID)
        delete inputData.questionID
        return answerStore.createAnswer(deviceDependencies, data)
      } catch (e) {
        throw e
      }
    },
  },
  Subscription: {
    answerUpdate: {
      async subscribe(rootValue, args, context) {
        if (!context.connection.context.Authorization) throw new Error('Not authorized or no permissions.')
        const auth = decode(context.connection.context.Authorization)
        const matchingDeviceId = getMatchingId(args.deviceID)
        const matchingContextId = getMatchingId(args.contextID)
        const [desiredDevice] = await context.models.device.get({ _id: matchingDeviceId })

        if (!desiredDevice.context || desiredDevice.context !== matchingContextId) throw new Error('Selected device is not inside of selected context.')

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
          (__, ___, { pubsub }) => pubsub.asyncIterator(SUB_ANSWERS),
          (payload, variables) =>
            (payload.answerUpdate.deviceId === getMatchingId(variables.deviceID)
              && payload.answerUpdate.contextId === getMatchingId(variables.contextID)),
        )(rootValue, args, context)
      },
    },
    newVote: {
      async subscribe(rootValue, args, context) {
        if (!context.connection.context.Authorization) throw new Error('Not authorized or no permissions.')
        const auth = decode(context.connection.context.Authorization)
        const matchingSurveyId = getMatchingId(args.surveyID)
        const [desiredSurvey] = await context.models.survey.get({ _id: matchingSurveyId })

        switch (auth.type) {
          case 'user': {
            if (!auth.isAdmin) {
              const matchingUserId = getMatchingId(auth.id)
              if (desiredSurvey.creator !== matchingUserId) throw new Error('Not authorized or no permissions.')
            }
            break
          }

          case 'device': {
            const matchingAuthDeviceId = getMatchingId(auth.id)

            const [device] = await context.models.device.get({ _id: matchingAuthDeviceId })

            if (!device.context) throw new Error('Not authorized or no permissions.')

            const [deviceContext] = await context.models.context.get({ _id: device.context })

            if (deviceContext.activeSurvey !== matchingSurveyId) throw new Error('Not authorized or no permissions.')
            break
          }

          default: throw new Error('Not authorized or no permissions.')
        }

        return withFilter(
          (__, ___, { pubsub }) => pubsub.asyncIterator(SUB_VOTES),
          (payload, variables) =>
            payload.newVote.surveyId === getMatchingId(variables.surveyID),
        )(rootValue, args, context)
      },
    },
  },
  Vote: {
    id: async (parent, args, context, info) => createHashFromId(parent.id),
    context: async (parent, args, context, info) => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'context')
        && parent.context !== null && parent.context !== '') ? createHashFromId(parent.context) : null),
    device: async (parent, args, context, info) => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'device')
      && parent.device !== null && parent.device !== '') ? createHashFromId(parent.device) : null),
  },
  Answer: {
    __resolveType(obj, context, info) {
      switch (obj.type) {
        case 'LIKE': return 'LikeAnswer'
        case 'LIKEDISLIKE': return 'LikeDislikeAnswer'
        case 'CHOICE': return 'ChoiceAnswer'
        case 'REGULATOR': return 'RegulatorAnswer'
        case 'RANKING': return 'RankingAnswer'
        case 'FAVORITE': return 'FavoriteAnswer'
        default: throw new Error('Unkown Answer')
      }
    },
  },
  LikeAnswer: sharedResolvers,
  LikeDislikeAnswer: sharedResolvers,
  ChoiceAnswer: sharedResolvers,
  RegulatorAnswer: sharedResolvers,
  RankingAnswer: {
    ...sharedResolvers,
    rankedImages: async (parent, args, context, info) => ((Object.prototype.hasOwnProperty.call((parent.toObject) ? parent.toObject() : parent, 'rankedImages')
        && parent.rankedImages !== null
        && parent.rankedImages.length !== 0)
      ? parent.rankedImages.map(image => createHashFromId(image)) : null),
  },
  FavoriteAnswer: {
    ...sharedResolvers,
    favoriteImage: async (parent, args, context, info) => ((Object.prototype.hasOwnProperty.call((parent.toObject) ? parent.toObject() : parent, 'favoriteImage')
        && parent.favoriteImage !== null
        && parent.favoriteImage !== '')
      ? createHashFromId(parent.favoriteImage) : null),
  },
}
