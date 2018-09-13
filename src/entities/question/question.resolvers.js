const { getMatchingId, createHashFromId } = require('../../utils/idStore')
const config = require('../../../config')
const { ADMIN } = require('../../utils/roles')

const getRequestedQuestionIfAuthorized = async (auth, questionId, models) => {
  const matchingQuestionId = getMatchingId(questionId)
  const [question] = await models.question.get({ _id: matchingQuestionId })

  if (!(auth.role === ADMIN || auth.id === question.user)) { throw new Error('Not authorized or no permissions.') }

  return question
}

const getUpdateWithoutImageField = data => Object.keys(data).reduce((acc, key) =>
  ((key !== 'image') ? { ...acc, [key]: data[key] } : acc), {})

const uploadImage =
  async (image, questionId, userId, models, imageStore, bonusDBImageAttributes) => {
    const upload = await imageStore.saveImage(await image, userId)

    const updatedUpload = {
      ...upload,
      ...bonusDBImageAttributes,
      user: userId,
      question: questionId,
    }

    try {
      return models.image.insert(updatedUpload)
    } catch (e) {
      await imageStore.removeImage(upload.name, userId)
      throw new Error('Image upload failed. Try again later.')
    }
  }

const uploadIcon = async (key, data, question, models, imageStore) => {
  const [survey] = await models.survey.get({ _id: question.survey })

  const imageData = await uploadImage(
    data[key],
    question.id,
    survey.creator,
    models,
    imageStore,
    {},
  )

  return imageData
}

const processQuestionUpdate = async (data, question, models, imageStore) => {
  const updatedData = data
  if (updatedData.likeIcon) {
    const likeIconData = await uploadIcon('likeIcon', data, question, models, imageStore)
    updatedData.likeIcon = likeIconData.id
  }

  if (updatedData.dislikeIcon) {
    const dislikeIconData = await uploadIcon('dislikeIcon', data, question, models, imageStore)
    updatedData.dislikeIcon = dislikeIconData.id
  }

  const [updatedQuestion] = await models.question.update({ _id: question.id }, updatedData)
  return updatedQuestion
}

const sharedResolver = {
  id: async (parent, args, context, info) => createHashFromId(parent.id),
  value: async (parent, args, context, info) => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'value')
    && parent.value !== null && parent.value !== '') ? parent.value : null),
  description: async (parent, args, context, info) => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'description')
    && parent.description !== null && parent.description !== '') ? parent.description : null),
  items: async (parent, args, context, info) => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'items')
      && parent.items !== null && parent.items.length !== 0) ? parent.items : null),
}

module.exports = {
  Mutation: {
    createQuestion: async (parent, { data }, { request, models }) => {
      const { auth } = request
      const matchingSurveyID = getMatchingId(data.surveyID)
      const [survey] = await models.survey.get({ _id: matchingSurveyID })

      if (!(auth.role === ADMIN || auth.id === survey.creator)) { throw new Error('Not authorized or no permissions.') }

      const updatedData = data
      updatedData.survey = matchingSurveyID
      delete updatedData.surveyID
      updatedData.user = survey.creator

      return { question: await models.question.insert(updatedData) }
    },
    updateQuestion: async (parent, { data, questionID }, { request, models, imageStore }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      return { question: await processQuestionUpdate(data, question, models, imageStore) }
    },
    deleteQuestion: async (parent, { questionID }, { request, models }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const result = await models.question.delete({ _id: question.id })
      return { success: result.n > 0 }
    },
    createItem: async (parent, { data, questionID }, { request, models, imageStore }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const itemData = getUpdateWithoutImageField(data)

      let item = await models.question.insertItem(question.id, itemData)

      if (data.image) {
        const imageData = await uploadImage(
          data.image,
          question.id,
          question.user,
          models,
          imageStore,
          { item: item.id },
        )

        item = await models.question.updateItem(
          question.id,
          item.id,
          { image: imageData.id },
        )
      }

      return { item }
    },
    updateItem: async (parent, { data, questionID, itemID }, { request, models, imageStore }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const matchingItemID = getMatchingId(itemID)

      const oldItem = question.items.find(item => item.id === matchingItemID)
      if (!oldItem) throw new Error('Item not found.')

      const update = getUpdateWithoutImageField(data)

      if (data.image) {
        const imageData = await uploadImage(
          data.image,
          question.id,
          question.user,
          models,
          imageStore,
          { item: matchingItemID },
        )

        update.image = imageData.id
      }

      const item = await models.question.updateItem(
        question.id,
        matchingItemID,
        update,
      )

      return { item }
    },
    deleteItem: async (parent, { data, questionID, itemID }, { request, models }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const matchingItemID = getMatchingId(itemID)

      await models.question.deleteItem(question.id, matchingItemID)

      return { success: true }
    },
    createLabel: async (parent, { data, questionID }, { request, models, imageStore }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const labelData = getUpdateWithoutImageField(data)

      let label = await models.question.insertLabel(question.id, labelData)

      if (data.image) {
        const imageData = await uploadImage(
          data.image,
          question.id,
          question.user,
          models,
          imageStore,
          { label: label.id },
        )

        label = await models.question.updateLabel(
          question.id,
          label.id,
          { image: imageData.id },
        )
      }

      return { label }
    },
    updateLabel: async (parent, { data, questionID, labelID }, { request, models, imageStore }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const matchingLabelID = getMatchingId(labelID)

      const oldLabel = question.labels.find(item => item.id === matchingLabelID)
      if (!oldLabel) throw new Error('Label not found.')

      const update = getUpdateWithoutImageField(data)

      if (data.image) {
        const imageData = await uploadImage(
          data.image,
          question.id,
          question.user,
          models,
          imageStore,
          { label: matchingLabelID },
        )

        update.image = imageData.id
      }

      const label = await models.question.updateLabel(
        question.id,
        matchingLabelID,
        update,
      )

      return { label }
    },
    deleteLabel: async (parent, { data, questionID, labelID }, { request, models }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const matchingLabelID = getMatchingId(labelID)

      await models.question.deleteLabel(question.id, matchingLabelID)

      return { success: true }
    },
    createChoice: async (parent, { data, questionID }, { request, models, imageStore }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const choiceData = getUpdateWithoutImageField(data)

      let choice = await models.question.insertChoice(question.id, choiceData)

      if (data.image) {
        const imageData = await uploadImage(
          data.image,
          question.id,
          question.user,
          models,
          imageStore,
          { choice: choice.id },
        )

        choice = await models.question.updateChoice(
          question.id,
          choice.id,
          { image: imageData.id },
        )
      }

      return { choice }
    },
    updateChoice: async (parent, { data, questionID, choiceID },
      { request, models, imageStore }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const matchingChoiceID = getMatchingId(choiceID)

      const oldChoice = question.choices.find(item => item.id === matchingChoiceID)
      if (!oldChoice) throw new Error('Label not found.')

      const update = getUpdateWithoutImageField(data)

      if (data.image) {
        const imageData = await uploadImage(
          data.image,
          question.id,
          question.user,
          models,
          imageStore,
          { choice: matchingChoiceID },
        )

        update.image = imageData.id
      }

      const choice = await models.question.updateChoice(
        question.id,
        matchingChoiceID,
        update,
      )

      return { choice }
    },
    deleteChoice: async (parent, { data, questionID, choiceID }, { request, models }) => {
      const { auth } = request
      const question = await getRequestedQuestionIfAuthorized(auth, questionID, models)

      const matchingChoiceID = getMatchingId(choiceID)

      await models.question.deleteChoice(question.id, matchingChoiceID)

      return { success: true }
    },
  },
  Question: {
    __resolveType(obj) {
      switch (obj.type) {
        case 'LIKE': return 'LikeQuestion'
        case 'LIKEDISLIKE': return 'LikeDislikeQuestion'
        case 'CHOICE': return 'ChoiceQuestion'
        case 'REGULATOR': return 'RegulatorQuestion'
        case 'RANKING': return 'RankingQuestion'
        case 'FAVORITE': return 'FavoriteQuestion'
        default: throw new Error('Unkown Question')
      }
    },
  },
  LikeQuestion: {
    ...sharedResolver,
    likeIcon: async (parent, args, { models }) => {
      let likeIcon
      if (Object.prototype.hasOwnProperty.call(parent.toObject(), 'likeIcon') && parent.likeIcon !== null) {
        [likeIcon] = await models.image.get({ _id: parent.likeIcon })
      } else [likeIcon] = await models.image.get({ url: `${config.app.defaultFolder}/likeIcon.png` })
      return likeIcon
    },
  },
  LikeDislikeQuestion: {
    ...sharedResolver,
    likeIcon: async (parent, args, { models }) => {
      let likeIcon
      if (Object.prototype.hasOwnProperty.call(parent.toObject(), 'likeIcon') && parent.likeIcon !== null) {
        [likeIcon] = await models.image.get({ _id: parent.likeIcon })
      } else [likeIcon] = await models.image.get({ url: `${config.app.defaultFolder}/likeIcon.png` })
      return likeIcon
    },
    dislikeIcon: async (parent, args, { models }) => {
      let dislikeIcon
      if (Object.prototype.hasOwnProperty.call(parent.toObject(), 'dislikeIcon') && parent.dislikeIcon !== null) {
        [dislikeIcon] = await models.image.get({ _id: parent.dislikeIcon })
      } else [dislikeIcon] = await models.image.get({ url: `${config.app.defaultFolder}/dislikeIcon.png` })
      return dislikeIcon
    },
  },
  ChoiceQuestion: {
    ...sharedResolver,
    default: async parent => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'choiceDefault')
      && parent.choiceDefault !== null && parent.choiceDefault !== '') ? parent.choiceDefault : null),
    choices: async parent => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'choices')
      && parent.choices !== null && parent.choices.length !== 0) ? parent.choices : null),
  },
  RegulatorQuestion: {
    ...sharedResolver,
    default: async parent => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'regulatorDefault')
      && parent.regulatorDefault !== null && parent.regulatorDefault !== '') ? parent.regulatorDefault : null),
    labels: async parent => ((Object.prototype.hasOwnProperty.call(parent.toObject(), 'labels')
      && parent.labels !== null && parent.labels.length !== 0) ? parent.labels : null),
  },
  RankingQuestion: sharedResolver,
  FavoriteQuestion: sharedResolver,
  Item: {
    id: async ({ id }) => createHashFromId(id),
    image: async ({ image }, args, { models }) => {
      try {
        const [imageData] = await models.image.get({ _id: image })
        return imageData
      } catch (e) {
        return null
      }
    },
  },
  Label: {
    id: async ({ id }) => createHashFromId(id),
    image: async ({ image }, args, { models }) => {
      try {
        const [imageData] = await models.image.get({ _id: image })
        return imageData
      } catch (e) {
        return null
      }
    },
  },
  ChoiceDescription: {
    id: async ({ id }) => createHashFromId(id),
    image: async ({ image }, args, { models }) => {
      try {
        const [imageData] = await models.image.get({ _id: image })
        return imageData
      } catch (e) {
        return null
      }
    },
  },
}
