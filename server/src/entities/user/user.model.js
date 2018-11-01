const userSchema = require('./user.schema')
const _ = require('underscore')

module.exports = (db, eventEmitter) => {
  const userModel = {}
  const User = db.model('user', userSchema, 'user')

  userModel.isEmailFree = async (email, userId) =>
    await User.count({ email, _id: { $ne: userId } }) === 0

  userModel.get = async (find, limit, offset, sort) => {
    try {
      const users = await User.find(find).limit(limit).skip(offset).sort(sort)
      if (users.length === 0) throw new Error('No User found.')
      return users
    } catch (e) {
      throw e
    }
  }

  userModel.insert = async (object) => {
    try {
      const user = await new User(object).save()

      eventEmitter.emit('User/Insert', user)

      return user
    } catch (e) {
      throw e
    }
  }

  userModel.update = async (where, data) => {
    try {
      const oldUsers = await User.find(where)
      const result = await User.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('No User found.')
      if (result.nModified === 0) throw new Error('User update failed.')

      const oldIds = oldUsers.map(user => user.id)
      const updatedUsers = await User.find({ _id: { $in: oldIds } })

      const sortObj =
        updatedUsers.reduce((acc, user, index) => ({ ...acc, [user.id]: index }), {})
      const oldUsersSorted = _.sortBy(oldUsers, user => sortObj[user.id])

      eventEmitter.emit('User/Update', updatedUsers, oldUsersSorted)

      return updatedUsers
    } catch (e) {
      throw e
    }
  }

  userModel.delete = async (where) => {
    try {
      const deletedUsers = await User.find(where)
      if (deletedUsers.length === 0) throw new Error('No User found.')
      const result = await User.deleteMany(where)
      if (result.n === 0) throw new Error('User deletion failed.')

      eventEmitter.emit('User/Delete', deletedUsers)

      return result
    } catch (e) {
      throw e
    }
  }

  return Object.freeze(userModel)
}
