const voteSchema = require('./vote.schema')
const _ = require('underscore')

module.exports = (db, eventEmitter) => {
  const voteModel = {}

  const Vote = db.model('vote', voteSchema, 'vote')

  voteModel.get = async (find, limit, offset, sort) => {
    try {
      const votes = await Vote.find(find)
        .limit(limit)
        .skip(offset)
        .sort(sort)
      if (votes.length === 0) throw new Error('No Vote found')
      return votes
    } catch (e) {
      throw e
    }
  }

  voteModel.insert = async (object) => {
    try {
      const vote = await new Vote(object).save()

      eventEmitter.emit('Vote/Insert', vote)

      return vote
    } catch (e) {
      throw e
    }
  }

  voteModel.update = async (where, data) => {
    try {
      const result = await Vote.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('No Vote found.')
      if (result.nModified === 0) throw new Error('Vote update failed.')
      const updatedVotes = await Vote.find(where)

      eventEmitter.emit('Vote/Update', updatedVotes)

      return updatedVotes
    } catch (e) {
      throw e
    }
  }

  voteModel.delete = async (where) => {
    try {
      const votes = await Vote.find(where)
      if (votes.length === 0) throw new Error('No Vote found.')
      const result = await Vote.deleteMany(where)
      if (result.n === 0) throw new Error('Vote deletion failed.')

      eventEmitter.emit('Vote/Delete', votes)

      return result
    } catch (e) {
      throw e
    }
  }

  /** EventEmitter reactions * */

  /** Delete Votes of deleted surveys * */
  eventEmitter.on('Survey/Delete', async (deletedSurveys) => {
    try {
      const deletedIds = deletedSurveys.map(survey => survey.id)
      await voteModel.delete({ survey: { $in: deletedIds } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Update Contexts referencing updated Surveys * */
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

  /* eventEmitter.on('Survey/Update', async (updatedSurveys, oldSurveys) => {
    try {
      const changedSurveys = updatedSurveys.reduce((acc, survey, index) => {
        const changedAttributes =
          getChangedAttributes(survey.toObject(), oldSurveys[index].toObject())

        if (changedAttributes && (changedAttributes.length > 1
          || (changedAttributes.length === 1
          && !changedAttributes.includes('isPublic')))) return [...acc, survey.id]

        return acc
      }, [])

      if (changedSurveys.length > 0) {
        await voteModel.delete({ survey: { $in: changedSurveys } })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  }) */

  eventEmitter.on('Question/Update', async (updatedQuestions, oldQuestions) => {
    try {
      const changedSurveys = updatedQuestions.reduce((acc, question, index) => {
        const changedAttributes =
          getChangedAttributes(question.toObject(), oldQuestions[index].toObject())

        if (changedAttributes && changedAttributes.length > 0) return [...acc, question.survey]

        return acc
      }, [])

      if (changedSurveys.length > 0) {
        await voteModel.delete({ survey: { $in: changedSurveys } })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  eventEmitter.on('Question/Insert', async (question) => {
    try {
      await voteModel.delete({ survey: question.survey })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  eventEmitter.on('Question/Delete', async (deletedQuestions) => {
    try {
      const changedSurveys = deletedQuestions.map(question => question.survey)

      if (changedSurveys.length > 0) {
        await voteModel.delete({ survey: { $in: _.uniq(changedSurveys) } })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  const reactToInnerQuestionObjectUpdate = async (object, oldObject, question) => {
    try {
      await voteModel.delete({ survey: question.survey })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  }

  const reactToInnerQuestionObjectInsertOrDelete = async (object, question) => {
    try {
      await voteModel.delete({ survey: question.survey })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  }

  eventEmitter.on('Item/Update', reactToInnerQuestionObjectUpdate)

  eventEmitter.on('Item/Insert', reactToInnerQuestionObjectInsertOrDelete)

  eventEmitter.on('Item/Delete', reactToInnerQuestionObjectInsertOrDelete)

  eventEmitter.on('Choice/Update', reactToInnerQuestionObjectUpdate)

  eventEmitter.on('Choice/Insert', reactToInnerQuestionObjectInsertOrDelete)

  eventEmitter.on('Choice/Delete', reactToInnerQuestionObjectInsertOrDelete)

  eventEmitter.on('Label/Update', reactToInnerQuestionObjectUpdate)

  eventEmitter.on('Label/Insert', reactToInnerQuestionObjectInsertOrDelete)

  eventEmitter.on('Label/Delete', reactToInnerQuestionObjectInsertOrDelete)

  return Object.freeze(voteModel)
}
