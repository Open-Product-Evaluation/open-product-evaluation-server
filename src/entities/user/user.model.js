const userSchema = require('./user.schema')

module.exports = (db, eventEmitter) => {
  const userModel = {}
  const User = db.model('user', userSchema, 'user')

  const isEmailFree = async email => await User.count({ email }) === 0

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
      if (await isEmailFree(object.email)) {
        const user = await new User(object).save()

        eventEmitter.emit('User/Insert', user)

        return user
      }
      throw new Error('Email already in use. Could not create user.')
    } catch (e) {
      throw e
    }
  }

  userModel.update = async (where, data) => {
    try {
      if (Object.prototype.hasOwnProperty.call(data, 'email') && !(await isEmailFree(data.email))) throw new Error('Email already in use. Could not update user.')
      const oldUsers = await User.find(where)
      const result = await User.updateMany(where, data)
      if (result.nMatched === 0) throw new Error('No User found.')
      if (result.nModified === 0) throw new Error('User update failed.')
      const updatedUsers = await User.find(where)

      eventEmitter.emit('User/Update', updatedUsers, oldUsers)

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
