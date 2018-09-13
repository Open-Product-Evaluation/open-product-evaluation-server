/**
 * Created by Dennis Dubbert on 03.09.18.
 */

const {
  SUB_VOTES,
  SUB_ANSWERS,
  SUB_CONTEXT,
  SUB_DEVICE,
  SUB_USER,
} = require('./pubsubChannels')
const { UPDATE, DELETE, INSERT } = require('./subscriptionEvents')
const _ = require('underscore')

const filterUnimportantAttributes = attributes =>
  attributes.filter(key => key[0] !== '_' && key !== 'lastUpdate' && key !== 'creationDate')

const keysAreEqual =
  (updatedArray, oldArray) => JSON.stringify(updatedArray) !== JSON.stringify(oldArray)

const getChangedAttributes = (updatedObject, oldObject) => {
  const keysFromUpdated = filterUnimportantAttributes(Object.keys(updatedObject))
  const keysFromOld = filterUnimportantAttributes(Object.keys(oldObject))

  const keysOnlyInUpdated = _.difference(keysFromUpdated, keysFromOld)
  const keysOnlyInOld = _.difference(keysFromOld, keysFromUpdated)
  const differentKeys = [...keysOnlyInUpdated, ...keysOnlyInOld]

  const sharedKeys = _.without(keysFromUpdated, ...differentKeys)
  sharedKeys.forEach((key) => {
    if (keysAreEqual(updatedObject[key], oldObject[key])) differentKeys.push(key)
  })

  return (differentKeys.length > 0) ? differentKeys : null
}

module.exports = (eventEmitter, pubsub, models) => {
  const notifyUser = (event, user, changedAttributes) => {
    pubsub.publish(SUB_USER, {
      userUpdate: {
        event,
        user,
        changedAttributes,
      },
    })
  }

  const notifyContext = (event, context, changedAttributes, stateKey) => {
    pubsub.publish(SUB_CONTEXT, {
      contextUpdate: {
        event,
        context,
        changedAttributes,
        stateKey,
      },
    })
  }

  const notifyDevice = (event, device, changedAttributes) => {
    pubsub.publish(SUB_DEVICE, {
      deviceUpdate: {
        event,
        device,
        changedAttributes,
      },
    })
  }

  const notifyAnswer = (event, answer, changedAttributes, deviceId, contextId) => {
    pubsub.publish(SUB_ANSWERS, {
      answerUpdate: {
        event,
        answer,
        changedAttributes,
        deviceId,
        contextId,
      },
    })
  }

  const notifyVote = (event, vote, surveyId) => {
    pubsub.publish(SUB_VOTES, {
      newVote: {
        event,
        vote,
        surveyId,
      },
    })
  }

  eventEmitter.on('User/Update', (updatedUsers, oldUsers) => {
    updatedUsers.forEach((user, index) => {
      const changedAttributes =
        getChangedAttributes(user.toObject(), oldUsers[index].toObject())

      notifyUser(UPDATE, user, changedAttributes)
    })
  })

  eventEmitter.on('User/Delete', (deletedUsers) => {
    deletedUsers.forEach((user) => {
      notifyUser(DELETE, user)
    })
  })

  eventEmitter.on('Survey/Update', (updatedSurveys, oldSurveys) => {
    updatedSurveys.forEach(async (survey, index) => {
      const changedAttributes =
        getChangedAttributes(survey.toObject(), oldSurveys[index].toObject())

      if (changedAttributes && !(changedAttributes.length === 1 && changedAttributes.includes('votes'))) {
        const contexts = await models.context.get({ activeSurvey: survey.id })

        contexts.forEach(context => notifyContext(UPDATE, context, ['activeSurvey']))
      }
    })
  })

  eventEmitter.on('Context/Update', (updatedContexts, oldContexts) => {
    updatedContexts.forEach(async (context, index) => {
      const changedAttributes =
        getChangedAttributes(context.toObject(), oldContexts[index].toObject())

      notifyContext(UPDATE, context, changedAttributes)

      const devices = await models.device.get({ context: context.id })
      devices.forEach((device) => {
        notifyDevice(UPDATE, device, ['context'])
      })
    })
  })

  eventEmitter.on('Context/Delete', (deletedContexts) => {
    deletedContexts.forEach(async (context) => {
      notifyContext(DELETE, context)
    })
  })

  eventEmitter.on('State/Insert', async (state, contextId) => {
    const [context] = await models.context.get({ _id: contextId })
    const changedAttributes = ['states']

    notifyContext(INSERT, context, changedAttributes, state.key)
  })

  eventEmitter.on('State/Update', async (state, contextId) => {
    const [context] = await models.context.get({ _id: contextId })
    const changedAttributes = ['states']

    notifyContext(UPDATE, context, changedAttributes, state.key)
  })

  eventEmitter.on('State/Delete', async (state, contextId) => {
    const [context] = await models.context.get({ _id: contextId })
    const changedAttributes = ['states']

    notifyContext(DELETE, context, changedAttributes, state.key)
  })

  eventEmitter.on('Device/Update', async (updatedDevices, oldDevices) => {
    updatedDevices.forEach(async (device, index) => {
      const changedAttributes =
        getChangedAttributes(device.toObject(), oldDevices[index].toObject())

      notifyDevice(UPDATE, device, changedAttributes)

      if (changedAttributes && changedAttributes.includes('context')) {
        if (device.context) {
          try {
            const updatedContext = await models.context.get({ _id: device.context })

            notifyContext(UPDATE, updatedContext, ['devices'])
          } catch (e) {
            console.log(e)
          }
        }

        if (oldDevices[index].context) {
          try {
            const oldContext = await models.context.get({ _id: oldDevices[index].context })

            notifyContext(UPDATE, oldContext, ['devices'])
          } catch (e) {
            console.log(e)
          }
        }
      }
    })
  })

  eventEmitter.on('Device/Delete', (deletedDevices) => {
    deletedDevices.forEach(async (device) => {
      notifyDevice(DELETE, device)

      if (device.context) {
        const context = await models.context.get({ _id: device.context })

        notifyContext(UPDATE, context, ['devices'])
      }
    })
  })

  eventEmitter.on('Answer/Insert', (answer, contextId, deviceId) => {
    notifyAnswer(INSERT, answer, null, deviceId, contextId)
  })

  eventEmitter.on('Answer/Update', (answer, oldAnswer, contextId, deviceId) => {
    const changedAttributes = getChangedAttributes(answer, oldAnswer)

    notifyAnswer(UPDATE, answer, changedAttributes, deviceId, contextId)
  })

  eventEmitter.on('Answer/Delete', (contextId, deviceId) => {
    notifyAnswer(DELETE, null, null, deviceId, contextId)
  })

  eventEmitter.on('Vote/Insert', (vote) => {
    notifyVote(INSERT, vote, vote.survey)
  })

  eventEmitter.on('Vote/Delete', (votes) => {
    votes.forEach(vote => notifyVote(DELETE, vote, vote.survey))
  })
}
