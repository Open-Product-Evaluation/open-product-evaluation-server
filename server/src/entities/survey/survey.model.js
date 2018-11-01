const surveySchema = require('./survey.schema')
const _ = require('underscore')

module.exports = (db, eventEmitter) => {
  const surveyModel = {}

  const Survey = db.model('survey', surveySchema, 'survey')

  surveyModel.get = async (find, limit, offset, sort) => {
    try {
      const surveys = await Survey.find(find)
        .limit(limit)
        .skip(offset)
        .sort(sort)
      if (surveys.length === 0) throw new Error('No Survey found.')
      return surveys
    } catch (e) {
      throw e
    }
  }

  surveyModel.insert = async (object) => {
    try {
      const survey = await new Survey(object).save()

      eventEmitter.emit('Survey/Insert', survey)

      return survey
    } catch (e) {
      throw e
    }
  }

  surveyModel.update = async (where, data) => {
    try {
      const oldSurveys = await Survey.find(where)
      const result = await Survey.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('No Survey found.')
      if (result.nModified === 0) throw new Error('Survey update failed.')

      const oldIds = oldSurveys.map(survey => survey.id)
      const updatedSurveys = await Survey.find({ _id: { $in: oldIds } })

      const sortObj =
        updatedSurveys.reduce((acc, survey, index) => ({ ...acc, [survey.id]: index }), {})
      const oldSurveysSorted = _.sortBy(oldSurveys, survey => sortObj[survey.id])

      eventEmitter.emit('Survey/Update', updatedSurveys, oldSurveysSorted)

      return updatedSurveys
    } catch (e) {
      throw e
    }
  }

  surveyModel.delete = async (where) => {
    try {
      const surveys = await Survey.find(where)
      if (surveys.length === 0) throw new Error('No Survey found.')
      const result = await Survey.deleteMany(where)
      if (result.n === 0) throw new Error('Survey deletion failed.')

      const notDeletedSurveys = await Survey.find(where)
      const deletedSurveys = surveys.filter(survey => !notDeletedSurveys.includes(survey))

      if (deletedSurveys.length > 0) eventEmitter.emit('Survey/Delete', deletedSurveys)

      return result
    } catch (e) {
      throw e
    }
  }

  /** EventEmitter reactions * */

  /** Delete Surveys of deleted user * */
  eventEmitter.on('User/Delete', async (deletedUsers) => {
    try {
      const userIds = deletedUsers.reduce((acc, user) => [...acc, user.id], [])
      await surveyModel.delete({ creator: { $in: userIds } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Update Survey when new Question was added * */
  eventEmitter.on('Question/Insert', async (question, newQuestionTypesOfSurvey) => {
    try {
      await surveyModel.update(
        { _id: question.survey },
        {
          $push: { questions: question.id },
          types: newQuestionTypesOfSurvey,
        },
      )
    } catch (e) {
      console.log(e)
    }
  })

  /** Update Survey when Questions were updated * */
  eventEmitter.on('Question/Update', async (question, oldQuestions, newQuestionTypesOfSurveys) => {
    try {
      const promises = newQuestionTypesOfSurveys.map(typesObject => surveyModel
        .update({ _id: typesObject.survey }, { types: typesObject.types }))
      await Promise.all(promises)
    } catch (e) {
      console.log(e)
    }
  })

  /** Update Surveys when Questions got deleted * */
  eventEmitter.on('Question/Delete', async (questions, newQuestionTypesOfSurveys) => {
    try {
      const promises = questions.map(question => surveyModel
        .update({ _id: question.survey }, { $pull: { questions: question.id } }))
      await Promise.all(promises)
      //  TODO:
      //  Check amount of deleted Images and retry those still there
    } catch (e) {
      console.log(e)
    }

    try {
      const promises = newQuestionTypesOfSurveys.map(typesObject => surveyModel
        .update({ _id: typesObject.survey }, { types: typesObject.types }))
      await Promise.all(promises)
    } catch (e) {
      console.log(e)
    }
  })

  return Object.freeze(surveyModel)
}
