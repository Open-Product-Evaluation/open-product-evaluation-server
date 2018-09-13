/**
 * Created by Dennis Dubbert on 11.07.18.
 */
const { getMatchingId } = require('./idStore')
const _ = require('underscore')
const config = require('../../config')

/** cache für antworten { surveyId: { contextId: { deviceID: { [answers], timeout } } } } * */
const answerCache = {}

/** cache für Questions (key = surveyID) * */
const questionCache = {}

module.exports = (models, eventEmitter) => {
  const clearAllDeviceTimeoutsForSurvey = (surveyId) => {
    Object.keys(answerCache[surveyId]).forEach((cachedContext) => {
      Object.keys(answerCache[surveyId][cachedContext]).forEach((cachedDevice) => {
        clearTimeout(answerCache[surveyId][cachedContext][cachedDevice].timeout)
      })
    })
  }

  const removeSurveyFromCache = (surveyId) => {
    if (Object.prototype.hasOwnProperty.call(answerCache, surveyId)) {
      clearAllDeviceTimeoutsForSurvey(surveyId)
      delete answerCache[surveyId]
    }

    if (Object.prototype.hasOwnProperty.call(questionCache, surveyId)) {
      clearTimeout(questionCache[surveyId].timeout)
      delete questionCache[surveyId]
    }
  }

  const removeContextFromCache = (surveyId, contextId) => {
    if (Object.prototype.hasOwnProperty.call(answerCache, surveyId)) {
      delete answerCache[surveyId][contextId]
      if (Object.keys(answerCache[surveyId]).length === 0) {
        removeSurveyFromCache(surveyId)
      }
    }
  }

  const removeDeviceFromCache = (surveyId, contextId, deviceId) => {
    if (Object.prototype.hasOwnProperty.call(answerCache, surveyId)
      && Object.prototype.hasOwnProperty.call(answerCache[surveyId], contextId)) {
      clearTimeout(answerCache[surveyId][contextId][deviceId].timeout)
      delete answerCache[surveyId][contextId][deviceId]
      if (Object.keys(answerCache[surveyId][contextId]).length === 0) {
        removeContextFromCache(surveyId, contextId)
      }
    }
  }

  const enhanceAnswerIfValid = (question, answerInput) => {
    let enhancedAnswer
    switch (question.type) {
      case 'LIKE': {
        if (Object.prototype.hasOwnProperty.call(answerInput, 'liked')) {
          enhancedAnswer = { ...answerInput, type: 'LIKE' }
        } break
      }
      case 'LIKEDISLIKE': {
        if (Object.prototype.hasOwnProperty.call(answerInput, 'liked')) {
          enhancedAnswer = { ...answerInput, type: 'LIKEDISLIKE' }
        } break
      }
      case 'CHOICE': {
        if (Object.prototype.hasOwnProperty.call(answerInput, 'choiceCode')) {
          if (answerInput.choiceCode !== null) {
            const choices = question.choices.map(choiceDescription => choiceDescription.code)
            if (choices.indexOf(answerInput.choiceCode) === -1) break
          } enhancedAnswer = { ...answerInput, type: 'CHOICE' }
        } break
      }
      case 'REGULATOR': {
        if (Object.prototype.hasOwnProperty.call(answerInput, 'rating')) {
          if (answerInput.rating !== null) {
            const { rating } = answerInput
            const { max, min, stepSize } = question
            if (rating >= min && rating <= max && ((rating * 100) % (stepSize * 100)) === 0) {
              const distance = Math.abs(max - min)
              enhancedAnswer = { ...answerInput, normalized: ((rating - min) / distance), type: 'REGULATOR' }
            }
          } else { enhancedAnswer = { ...answerInput, normalized: null, type: 'REGULATOR' } }
        } break
      }
      case 'RANKING': {
        if (Object.prototype.hasOwnProperty.call(answerInput, 'rankedImages')) {
          if (answerInput.rankedImages !== null) {
            const rankedImages = answerInput.rankedImages.map(imageId => getMatchingId(imageId))
            const questionItems = question.items.reduce((acc, item) => [...acc, item.image], [])
            if (rankedImages.length === questionItems.length
              && _.without(questionItems, ...rankedImages).length === 0) {
              enhancedAnswer = { ...answerInput, type: 'RANKING' }
              enhancedAnswer.rankedImages = rankedImages
            }
          } else { enhancedAnswer = { ...answerInput, type: 'RANKING' } }
        } break
      }
      case 'FAVORITE': {
        if (Object.prototype.hasOwnProperty.call(answerInput, 'favoriteImage')) {
          if (answerInput.favoriteImage !== null) {
            const favoriteImage = getMatchingId(answerInput.favoriteImage)
            const questionItems = question.items.reduce((acc, item) => [...acc, item.image], [])
            if (questionItems.indexOf(favoriteImage) > -1) {
              enhancedAnswer = { ...answerInput, type: 'FAVORITE' }
              enhancedAnswer.favoriteImage = favoriteImage
            }
          } else { enhancedAnswer = { ...answerInput, type: 'FAVORITE' } }
        } break
      }
      default: throw new Error('Answer is not valid.')
    }

    if (!enhancedAnswer) throw new Error('Answer is not valid.')
    return enhancedAnswer
  }

  const enhanceAnswerIfAllowedAndValid = async ({ survey }, answerInput) => {
    const surveyId = survey.id
    if (!Object.prototype.hasOwnProperty.call(questionCache, surveyId)) {
      const questions = await models.question.get({ survey: surveyId })
      if (questions.length === 0) throw new Error('Answer is not valid.')

      const questionIds = questions.map(question => question.id)
      const cacheData = {
        questionIds,
        questions,
        timeout: setTimeout(() => {
          delete questionCache[surveyId]
        }, config.app.questionCacheTime),
      }

      questionCache[surveyId] = cacheData
    }

    clearTimeout(questionCache[surveyId].timeout)
    questionCache[surveyId].timeout = setTimeout(() => {
      delete questionCache[surveyId]
    }, config.app.questionCacheTime)

    const answerQuestionId = answerInput.question
    const questionIndex = questionCache[surveyId].questionIds.indexOf(answerQuestionId)
    if (questionIndex === -1) throw new Error('Answer is not valid.')

    const question = questionCache[surveyId].questions[questionIndex]

    return enhanceAnswerIfValid(question, answerInput)
  }

  const persistVote = async ({ context, device, survey }, answers) => {
    const contextId = context.id
    const deviceId = device.id
    const surveyId = survey.id
    const vote = {
      survey: surveyId,
      context: contextId,
      device: deviceId,
      answers,
    }
    return models.vote.insert(vote)
  }

  const persistAnswer = async (deviceDependencies, answer) => {
    const { device, context, survey } = deviceDependencies
    const deviceId = device.id
    const contextId = context.id
    const surveyId = survey.id
    const { questionIds } = questionCache[surveyId]

    if (questionIds.length === 1) {
      try {
        await persistVote(deviceDependencies, [answer])
        return { answer, voteCreated: true }
      } catch (e) {
        throw new Error('Vote could not be persistet. Please retry.')
      }
    }

    if (!Object.prototype.hasOwnProperty.call(answerCache, surveyId)) {
      answerCache[surveyId] = {}
    }

    if (!Object.prototype.hasOwnProperty.call(answerCache[surveyId], contextId)) {
      answerCache[surveyId][contextId] = {}
    }

    if (!Object.prototype.hasOwnProperty.call(answerCache[surveyId][contextId], deviceId)) {
      answerCache[surveyId][contextId][deviceId] = {
        answers: [],
        timeout: setTimeout(() => {
          removeDeviceFromCache(surveyId, contextId, deviceId)
        }, config.app.deviceCacheTime),
      }
    }

    const presentAnswers = answerCache[surveyId][contextId][deviceId].answers
    const answerQuestionIds = presentAnswers.map(presentAnswer => presentAnswer.question)
    const answerQuestionIndex = answerQuestionIds.indexOf(answer.question)

    if (answerQuestionIndex > -1) {
      const oldAnswer = answerCache[surveyId][contextId][deviceId].answers[answerQuestionIndex]

      answerCache[surveyId][contextId][deviceId].answers[answerQuestionIndex] = answer

      eventEmitter.emit('Answer/Update', answer, oldAnswer, contextId, deviceId)

      return { answer, voteCreated: false }
    }

    if (questionIds.length === presentAnswers.length + 1) {
      const answers = [...answerCache[surveyId][contextId][deviceId].answers, answer]
      try {
        await persistVote(deviceDependencies, answers)
        removeDeviceFromCache(surveyId, contextId, deviceId)

        eventEmitter.emit('Answer/Insert', answer, contextId, deviceId)

        return { answer, voteCreated: true }
      } catch (e) {
        throw new Error('Vote could not be persistet. Please retry.')
      }
    }

    clearTimeout(answerCache[surveyId][contextId][deviceId].timeout)
    answerCache[surveyId][contextId][deviceId].timeout = setTimeout(() => {
      removeDeviceFromCache(surveyId, contextId, deviceId)
      eventEmitter.emit('Answer/Delete', contextId, deviceId)
    }, config.app.deviceCacheTime)

    answerCache[surveyId][contextId][deviceId].answers.push(answer)
    eventEmitter.emit('Answer/Insert', answer, contextId, deviceId)

    return { answer, voteCreated: false }
  }

  const createAnswer = async (deviceDependencies, answerInput) => {
    const updatedAnswerInput = await enhanceAnswerIfAllowedAndValid(deviceDependencies, answerInput)
    return persistAnswer(deviceDependencies, updatedAnswerInput)
  }

  eventEmitter.on('Survey/Delete', (deletedSurveys) => {
    deletedSurveys.forEach(survey => removeSurveyFromCache(survey.id))
  })

  eventEmitter.on('Context/Delete', (deletedContexts) => {
    deletedContexts.forEach((context) => {
      if (Object.prototype.hasOwnProperty.call(context.toObject(), 'activeSurvey')
        && context.activeSurvey !== null
        && context.activeSurvey !== '') removeContextFromCache(context.activeSurvey, context._id)
    })
  })

  eventEmitter.on('Device/Delete', (deletedDevices) => {
    deletedDevices.forEach(async (device) => {
      if (Object.prototype.hasOwnProperty.call(device.toObject(), 'context')
        && device.context !== null
        && device.context !== '') {
        const [context] = await models.context.get({ _id: device.context })

        if (Object.prototype.hasOwnProperty.call(context.toObject(), 'activeSurvey')
          && context.activeSurvey !== null
          && context.activeSurvey !== '') removeDeviceFromCache(context.activeSurvey, context.id, device.id)
      }
    })
  })

  return Object.freeze({
    createAnswer,
  })
}
