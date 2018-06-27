const userSchema = require('./user.schema')

module.exports = (db) => {
  const User = db.model('user', userSchema, 'user')

  const isEmailFree = async email => await User.count({ email }) === 0

  return Object.freeze({
    get: async (find, limit, offset, sort) => {
      try {
        const users = await User.find(find).limit(limit).skip(offset).sort(sort)
        if (users.length === 0) throw new Error('User not found.')
        return users
      } catch (e) {
        throw e
      }
    },
    insert: async (object) => {
      try {
        if (await isEmailFree(object.email)) return await new User(object).save()
        throw new Error('Email already in use. Could not create user.')
      } catch (e) {
        throw e
      }
    },
    update: async (id, data) => {
      try {
        if (Object.prototype.hasOwnProperty.call(data, 'email') && !(await isEmailFree(data.email))) throw new Error('Email already in use. Could not update user.')
        const updatedUser = await User.findByIdAndUpdate(id, data, { new: true })
        if (!updatedUser) throw new Error('User not found.')
        return updatedUser
      } catch (e) {
        throw e
      }
    },
    delete: async (id) => {
      try {
        const deletedUser = await User.findByIdAndDelete(id)
        if (!deletedUser) throw new Error('User not found.')
        return deletedUser
      } catch (e) {
        throw e
      }
    },
  })
}
