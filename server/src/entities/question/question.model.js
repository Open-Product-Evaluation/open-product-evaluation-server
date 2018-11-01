const questionSchema = require('./question.schema')
const _ = require('underscore')

module.exports = (db, eventEmitter) => {
  const questionModel = {}

  const Question = db.model('question', questionSchema, 'question')

  const getAllQuestionTypesOfSurvey = async (surveyId) => {
    try {
      const questions = await questionModel.get({ survey: surveyId })
      const types = _.uniq((questions).map(question => question.type))
      return types
    } catch (e) {
      return []
    }
  }

  const getAllQuestionTypesOfSurveysFromQuestions = async (questions) => {
    const surveyIds = questions.reduce((acc, question) =>
      (acc.includes(question.survey) ? acc : [...acc, question.survey]), [])

    const getTypesPromises = surveyIds
      .map(surveyId => getAllQuestionTypesOfSurvey(surveyId))

    return (await Promise.all(getTypesPromises))
      .map((types, index) => ({
        survey: surveyIds[index],
        types,
      }))
  }

  questionModel.get = async (find, limit, offset, sort) => {
    try {
      const questions = await Question.find(find)
        .limit(limit)
        .skip(offset)
        .sort(sort)
      if (questions.length === 0) throw new Error('No Question found.')
      return questions
    } catch (e) {
      throw e
    }
  }

  questionModel.insert = async (object) => {
    try {
      const question = await new Question(object).save()
      const newQuestionTypesOfSurvey = await getAllQuestionTypesOfSurvey(question.survey)

      eventEmitter.emit('Question/Insert', question, newQuestionTypesOfSurvey)

      return question
    } catch (e) {
      throw e
    }
  }

  questionModel.update = async (where, data) => {
    try {
      const oldQuestions = await Question.find(where)
      const result = await Question.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('No Question found.')
      if (result.nModified === 0) throw new Error('Question update failed.')

      const oldIds = oldQuestions.map(question => question.id)
      const updatedQuestions = await Question.find({ _id: { $in: oldIds } })

      const sortObj =
        updatedQuestions.reduce((acc, question, index) => ({ ...acc, [question.id]: index }), {})
      const oldQuestionsSorted = _.sortBy(oldQuestions, question => sortObj[question.id])

      const newQuestionTypesOfSurveys =
        await getAllQuestionTypesOfSurveysFromQuestions(updatedQuestions)

      eventEmitter.emit('Question/Update', updatedQuestions, oldQuestionsSorted, newQuestionTypesOfSurveys)

      return updatedQuestions
    } catch (e) {
      throw e
    }
  }

  questionModel.delete = async (where) => {
    try {
      const questions = await Question.find(where)
      const result = await Question.deleteMany(where)
      if (result.n === 0) throw new Error('Question deletion failed.')

      const notDeletedQuestions = await Question.find(where)
      const deletedQuestions = questions.filter(question => !notDeletedQuestions.includes(question))

      if (deletedQuestions.length > 0) {
        const newQuestionTypesOfSurveys =
          await getAllQuestionTypesOfSurveysFromQuestions(deletedQuestions)

        eventEmitter.emit('Question/Delete', deletedQuestions, newQuestionTypesOfSurveys)
      }

      //  TODO: Check amount of deleted Questions and retry those still there
      return result
    } catch (e) {
      throw e
    }
  }

  questionModel.insertItem = async (questionId, itemData) => {
    try {
      const question = await Question.findByIdAndUpdate(
        questionId,
        { $push: { items: itemData } },
        { new: true },
      )

      const item = question.items[question.items.length - 1]

      eventEmitter.emit('Item/Insert', item, question)

      return item
    } catch (e) {
      throw e
    }
  }

  questionModel.updateItem = async (questionId, itemId, update) => {
    try {
      const [oldQuestion] = await questionModel.get({ _id: questionId })
      const oldItem = oldQuestion.items.find(item => item.id === itemId)

      if (!oldItem) throw new Error('Item not found.')

      const correctedUpdate = {}

      Object.keys(update).forEach((key) => {
        correctedUpdate[`items.$.${key}`] = update[key]
      })

      const question = await Question.findOneAndUpdate({
        _id: questionId,
        'items._id': itemId,
      }, correctedUpdate, { new: true })

      const item = question.items.find(i => i.id === itemId)

      eventEmitter.emit('Item/Update', item, oldItem, question)

      return item
    } catch (e) {
      throw e
    }
  }

  questionModel.deleteItem = async (questionId, itemId) => {
    try {
      const oldQuestion = await Question.findOne({
        _id: questionId,
      })

      const item = oldQuestion.items.find(i => i.id === itemId)

      if (!item) throw new Error('Item not found.')

      const question = await Question.findOneAndUpdate({
        _id: questionId,
      }, { $pull: { items: { _id: itemId } } }, { new: true })

      eventEmitter.emit('Item/Delete', item, question)

      return item
    } catch (e) {
      throw e
    }
  }

  questionModel.insertLabel = async (questionId, labelData) => {
    try {
      const question = await Question.findByIdAndUpdate(
        questionId,
        { $push: { labels: labelData } },
        { new: true },
      )

      const label = question.labels[question.labels.length - 1]

      eventEmitter.emit('Label/Insert', label, question)

      return label
    } catch (e) {
      throw e
    }
  }

  questionModel.updateLabel = async (questionId, labelId, update) => {
    try {
      const [oldQuestion] = await questionModel.get({ _id: questionId })
      const oldLabel = oldQuestion.labels.find(label => label.id === labelId)

      if (!oldLabel) throw new Error('Label not found.')

      const correctedUpdate = {}

      Object.keys(update).forEach((key) => {
        correctedUpdate[`labels.$.${key}`] = update[key]
      })

      const question = await Question.findOneAndUpdate({
        _id: questionId,
        'labels._id': labelId,
      }, correctedUpdate, { new: true })

      const label = question.labels.find(l => l.id === labelId)

      eventEmitter.emit('Label/Update', label, oldLabel, question)

      return label
    } catch (e) {
      throw e
    }
  }

  questionModel.deleteLabel = async (questionId, labelId) => {
    try {
      const oldQuestion = await Question.findOne({
        _id: questionId,
      })

      const label = oldQuestion.labels.find(i => i.id === labelId)

      if (!label) throw new Error('Label not found.')

      const question = await Question.findOneAndUpdate({
        _id: questionId,
      }, { $pull: { labels: { _id: labelId } } }, { new: true })

      eventEmitter.emit('Label/Delete', label, question)

      return label
    } catch (e) {
      throw e
    }
  }

  questionModel.insertChoice = async (questionId, choiceData) => {
    try {
      const question = await Question.findByIdAndUpdate(
        questionId,
        { $push: { choices: choiceData } },
        { new: true },
      )

      const choice = question.choices[question.choices.length - 1]

      eventEmitter.emit('Choice/Insert', choice, question)

      return choice
    } catch (e) {
      throw e
    }
  }

  questionModel.updateChoice = async (questionId, choiceId, update) => {
    try {
      const [oldQuestion] = await questionModel.get({ _id: questionId })
      const oldChoice = oldQuestion.choices.find(choice => choice.id === choiceId)

      if (!oldChoice) throw new Error('Choice not found.')

      const correctedUpdate = {}

      Object.keys(update).forEach((key) => {
        correctedUpdate[`choices.$.${key}`] = update[key]
      })

      const question = await Question.findOneAndUpdate({
        _id: questionId,
        'choices._id': choiceId,
      }, correctedUpdate, { new: true })

      const choice = question.choices.find(c => c.id === choiceId)

      eventEmitter.emit('Choice/Update', choice, oldChoice, question)

      return choice
    } catch (e) {
      throw e
    }
  }

  questionModel.deleteChoice = async (questionId, choiceId) => {
    try {
      const oldQuestion = await Question.findOne({
        _id: questionId,
      })

      const choice = oldQuestion.choices.find(i => i.id === choiceId)

      if (!choice) throw new Error('Choice not found.')

      const question = await Question.findOneAndUpdate({
        _id: questionId,
      }, { $pull: { choices: { _id: choiceId } } }, { new: true })

      eventEmitter.emit('Choice/Delete', choice, question)

      return choice
    } catch (e) {
      throw e
    }
  }

  /** EventEmitter reactions * */

  /** Delete Questions and all sub-documents when survey was deleted * */
  eventEmitter.on('Survey/Delete', async (deletedSurveys) => {
    try {
      const deletedIds = deletedSurveys.map(survey => survey.id)
      await questionModel.delete({ survey: { $in: deletedIds } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  return Object.freeze(questionModel)
}
