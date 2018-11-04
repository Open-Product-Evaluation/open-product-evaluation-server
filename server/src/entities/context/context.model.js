const contextSchema = require('./context.schema')
const _ = require('underscore')

module.exports = (db, eventEmitter) => {
  const contextModel = {}

  const Context = db.model('context', contextSchema, 'context')

  contextModel.get = async (find, limit, offset, sort) => {
    try {
      const contexts = await Context.find(find)
        .limit(limit)
        .skip(offset)
        .sort(sort)

      if (contexts.length === 0) throw new Error('No contexts found')
      return contexts
    } catch (e) {
      throw e
    }
  }

  contextModel.insert = async (object) => {
    try {
      const context = await new Context(object).save()

      eventEmitter.emit('Context/Insert', context)

      return context
    } catch (e) {
      throw e
    }
  }

  contextModel.update = async (where, data) => {
    try {
      const currentContexts = await Context.find(where)
      const result = await Context.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('Context not found.')
      if (result.nModified === 0) throw new Error('Context update failed.')

      const currentIds = currentContexts.map(context => context.id)
      const updatedContexts = await Context.find({ _id: { $in: currentIds } })

      const sortObj =
        updatedContexts.reduce((acc, context, index) => ({ ...acc, [context.id]: index }), {})
      const currentContextsSorted = _.sortBy(currentContexts, context => sortObj[context.id])

      eventEmitter.emit('Context/Update', updatedContexts, currentContextsSorted)

      return updatedContexts
    } catch (e) {
      throw e
    }
  }

  contextModel.delete = async (where) => {
    try {
      const contexts = await Context.find(where)
      if (contexts.length === 0) throw new Error('Context not found.')
      const result = await Context.deleteMany(where)
      if (result.n === 0) throw new Error('Context deletion failed.')

      const notDeletedContexts = await Context.find(where)
      const deletedContexts = contexts.filter(context => !notDeletedContexts.includes(context))

      if (deletedContexts.length > 0) eventEmitter.emit('Context/Delete', deletedContexts)

      return result
    } catch (e) {
      throw e
    }
  }

  contextModel.insertState = async (contextID, key, value) => {
    try {
      const contextsWithKey = await Context
        .find({ $and: [{ _id: contextID }, { states: { $elemMatch: { key } } }] })
      if (contextsWithKey.length > 0) throw new Error('State already exists!')
      const newContext = await Context
        .findByIdAndUpdate(contextID, {
          $push: {
            states: {
              key,
              value,
            },
          },
        }, { new: true })

      const newState = newContext.states.find(state => state.key === key)

      eventEmitter.emit('State/Insert', newState, contextID)

      return newState
    } catch (e) {
      throw e
    }
  }

  contextModel.updateState = async (contextID, key, value) => {
    try {
      const results = await Context
        .update({
          _id: contextID,
          'states.key': key,
        }, { 'states.$.value': value })

      if (results.nModified !== 1 || results.ok !== 1) {
        throw new Error('Failed to update!')
      }

      const state = {
        key,
        value,
      }

      eventEmitter.emit('State/Update', state, contextID)

      return state
    } catch (e) {
      throw e
    }
  }

  contextModel.deleteState = async (contextID, key) => {
    try {
      const [contextsWithKey] = await Context
        .find({ $and: [{ _id: contextID }, { states: { $elemMatch: { key } } }] })
      if (!contextsWithKey) throw Error('State does not exist!')

      const deletedState = contextsWithKey.states.find(state => state.key === key)
      const updatedContext = await Context
        .findByIdAndUpdate(contextID, { $pull: { states: { key } } }, { new: true })
      if (!updatedContext) throw Error('Failed to delete!')

      eventEmitter.emit('State/Delete', deletedState, contextID)

      return deletedState
    } catch (e) {
      throw e
    }
  }

  /** EventEmitter reactions * */

  /** Update Contexts of deleted user * */
  eventEmitter.on('User/Delete', async (deletedUsers) => {
    try {
      const deletedIds = deletedUsers.map(user => user.id)
      await contextModel.update({}, { $pull: { owners: { $in: deletedIds } } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }

    /** delete contexts without owners * */
    try {
      await contextModel.delete({ owners: { $exists: true, $size: 0 } })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Update Contexts referencing deleted Surveys * */
  eventEmitter.on('Survey/Delete', async (deletedSurveys) => {
    try {
      const deletedIds = deletedSurveys.map(survey => survey.id)
      await contextModel.update({ activeSurvey: { $in: deletedIds } }, {
        $unset: {
          activeSurvey: '',
          activeQuestion: '',
        },
      })
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  /** Update Contexts referencing updated Surveys * */
  eventEmitter.on('Survey/Update', async (updatedSurveys, oldSurveys) => {
    try {
      const inactiveIds = updatedSurveys.reduce((acc, survey, index) => {
        if (!survey.isPublic && oldSurveys[index].isPublic) return [...acc, survey.id]
        return acc
      }, [])

      if (inactiveIds.length > 0) {
        await contextModel.update({ activeSurvey: { $in: inactiveIds } }, {
          $unset: {
            activeSurvey: '',
            activeQuestion: '',
          },
        })
      }
    } catch (e) {
      // TODO:
      // ggf. Modul erstellen, welches fehlgeschlagene DB-Zugriffe
      // in bestimmten abständen wiederholt
      // (nur für welche, die nicht ausschlaggebend für erfolg der query sind)
      console.log(e)
    }
  })

  return Object.freeze(contextModel)
}
