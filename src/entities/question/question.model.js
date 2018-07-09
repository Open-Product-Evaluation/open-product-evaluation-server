const questionSchema = require('./question.schema')
const dbLoader = require('../../utils/dbLoader')
const imageModel = require('../image/image.model')()
const _ = require('underscore')

module.exports = () => {
  const Question = dbLoader.getDB().model('question', questionSchema, 'question')

  const getQuestionsImages = (questions, key) => questions.reduce((acc, question) => {
    let questionImages = []
    if (Object.prototype.hasOwnProperty.call(question.toObject(), key)
      && question.toObject()[key] !== null) {
      questionImages = question.toObject()[key].reduce((accOldKey, object) =>
        ((Object.prototype.hasOwnProperty.call(object, 'image')) ? [...accOldKey, object.image] : accOldKey), [])
    }

    const images = [...acc, ...questionImages]
    return images
  }, [])

  const checkForAndDeleteRemovedImages = async (oldQuestions, updatedQuestions, key) => {
    const oldQuestionsImages = getQuestionsImages(oldQuestions, key)
    const updatedQuestionsImages = getQuestionsImages(updatedQuestions, key)
    const removedImages = _.without(oldQuestionsImages, ...updatedQuestionsImages)

    if (removedImages.length > 0) await imageModel.delete({ _id: { $in: removedImages } })
    //  TODO: Check amount of deleted Images and retry those still there
  }

  return Object.freeze({
    get: async (find, limit, offset, sort) => {
      try {
        const questions = await Question.find(find).limit(limit).skip(offset).sort(sort)
        if (questions.length === 0) throw new Error('No Question found.')
        return questions
      } catch (e) {
        throw e
      }
    },
    insert: async (object) => {
      try {
        //  TODO: test if all Images are present in the DB
        return (await new Question(object).save())
      } catch (e) {
        throw e
      }
    },
    update: async (where, data) => {
      try {
        let oldQuestions
        if (data.items || data.labels || data.choices) oldQuestions = await Question.find(where)
        const result = await Question.updateMany(where, data)
        if (result.nMatched === 0) throw new Error('No Question found.')
        if (result.nModified === 0) throw new Error('Question update failed.')
        const updatedQuestions = await Question.find(where)

        if (oldQuestions) {
          try {
            if (Object.prototype.hasOwnProperty.call(data, 'items')) await checkForAndDeleteRemovedImages(oldQuestions, updatedQuestions, 'items')
          } catch (e) {
            console.log(e)
          }
          try {
            if (Object.prototype.hasOwnProperty.call(data, 'labels')) await checkForAndDeleteRemovedImages(oldQuestions, updatedQuestions, 'labels')
          } catch (e) {
            console.log(e)
          }
          try {
            if (Object.prototype.hasOwnProperty.call(data, 'choices')) await checkForAndDeleteRemovedImages(oldQuestions, updatedQuestions, 'choices')
          } catch (e) {
            console.log(e)
          }
        }

        return updatedQuestions
      } catch (e) {
        throw e
      }
    },
    delete: async (where) => {
      try {
        const questions = await Question.find(where)
        const result = await Question.deleteMany(where)
        if (result.n === 0) throw new Error('Question deletion failed.')

        const itemImages = getQuestionsImages(questions, 'items')
        const labelImages = getQuestionsImages(questions, 'labels')
        const choiceImages = getQuestionsImages(questions, 'choices')
        const imagesToDelete = _.uniq([...itemImages, ...labelImages, ...choiceImages])

        try {
          if (imagesToDelete.length > 0) await imageModel.delete({ _id: { $in: imagesToDelete } })
          //  TODO: Check amount of deleted Images and retry those still there
        } catch (e) {
          console.log(e)
        }

        //  TODO: Check amount of deleted Questions and retry those still there
        return result
      } catch (e) {
        throw e
      }
    },
  })
}
